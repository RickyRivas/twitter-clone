CREATE OR REPLACE FUNCTION set_user_role(target_user_id uuid, new_role text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF (SELECT role FROM profiles WHERE id = auth.uid()) != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    IF new_role NOT IN ('user', 'moderator', 'admin') THEN
        RAISE EXCEPTION 'Invalid role';
    END IF;

    UPDATE profiles SET role = new_role WHERE id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_feed(p_user_id uuid, p_limit int DEFAULT 20, p_offset int DEFAULT 0)
RETURNS TABLE (
    id               uuid,
    author_id        uuid,
    content          text,
    reply_to_id      uuid,
    quote_of_id      uuid,
    likes_count      int,
    reposts_count    int,
    replies_count    int,
    views_count      int,
    created_at       timestamptz,
    username         text,
    display_name     text,
    avatar_public_id text
) LANGUAGE sql SECURITY DEFINER AS $$
    SELECT
        p.id, p.author_id, p.content, p.reply_to_id, p.quote_of_id,
        p.likes_count, p.reposts_count, p.replies_count, p.views_count, p.created_at,
        pr.username, pr.display_name, pr.avatar_public_id
    FROM posts p
    JOIN profiles pr ON p.author_id = pr.id
    WHERE p.reply_to_id IS NULL
      AND (
        p.author_id = p_user_id
        OR p.author_id IN (
            SELECT following_id FROM follows WHERE follower_id = p_user_id
        )
      )
    ORDER BY p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
$$;