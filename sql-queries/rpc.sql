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
RETURNS SETOF json LANGUAGE sql SECURITY DEFINER AS $$
    SELECT row_data FROM (
        -- original posts from followed users + own posts
        SELECT
            p.created_at AS sort_date,
            json_build_object(
                'id',             p.id,
                'author_id',      p.author_id,
                'content',        p.content,
                'reply_to_id',    p.reply_to_id,
                'quote_of_id',    p.quote_of_id,
                'likes_count',    p.likes_count,
                'reposts_count',  p.reposts_count,
                'replies_count',  p.replies_count,
                'views_count',    p.views_count,
                'created_at',     p.created_at,
                'sort_date',      p.created_at,
                'is_repost',      false,
                'reposted_by',    NULL::text,
                'liked',          EXISTS (
                                    SELECT 1 FROM likes
                                    WHERE likes.post_id = p.id
                                    AND likes.user_id = p_user_id
                                  ),
                'reposted',       EXISTS (
                                    SELECT 1 FROM reposts
                                    WHERE reposts.post_id = p.id
                                    AND reposts.user_id = p_user_id
                                  ),
                'profiles', json_build_object(
                    'id',               pr.id,
                    'username',         pr.username,
                    'display_name',     pr.display_name,
                    'avatar_public_id', pr.avatar_public_id
                ),
                'post_media', COALESCE((
                    SELECT json_agg(pm ORDER BY pm.position)
                    FROM post_media pm
                    WHERE pm.post_id = p.id
                ), '[]'::json)
            ) AS row_data
        FROM posts p
        JOIN profiles pr ON p.author_id = pr.id
        WHERE p.reply_to_id IS NULL
          AND (
            p.author_id = p_user_id
            OR p.author_id IN (
                SELECT following_id FROM follows WHERE follower_id = p_user_id
            )
          )

        UNION ALL

        -- reposts from followed users + own reposts
        SELECT
            r.created_at AS sort_date,
            json_build_object(
                'id',             p.id,
                'author_id',      p.author_id,
                'content',        p.content,
                'reply_to_id',    p.reply_to_id,
                'quote_of_id',    p.quote_of_id,
                'likes_count',    p.likes_count,
                'reposts_count',  p.reposts_count,
                'replies_count',  p.replies_count,
                'views_count',    p.views_count,
                'created_at',     p.created_at,
                'sort_date',      r.created_at,
                'is_repost',      true,
                'reposted_by',    rpr.username,
                'liked',          EXISTS (
                                    SELECT 1 FROM likes
                                    WHERE likes.post_id = p.id
                                    AND likes.user_id = p_user_id
                                  ),
                'reposted',       EXISTS (
                                    SELECT 1 FROM reposts
                                    WHERE reposts.post_id = p.id
                                    AND reposts.user_id = p_user_id
                                  ),
                'profiles', json_build_object(
                    'id',               pr.id,
                    'username',         pr.username,
                    'display_name',     pr.display_name,
                    'avatar_public_id', pr.avatar_public_id
                ),
                'post_media', COALESCE((
                    SELECT json_agg(pm ORDER BY pm.position)
                    FROM post_media pm
                    WHERE pm.post_id = p.id
                ), '[]'::json)
            ) AS row_data
        FROM reposts r
        JOIN posts p ON r.post_id = p.id
        JOIN profiles pr ON p.author_id = pr.id
        JOIN profiles rpr ON r.user_id = rpr.id
        WHERE p.reply_to_id IS NULL
          AND (
            r.user_id = p_user_id
            OR r.user_id IN (
                SELECT following_id FROM follows WHERE follower_id = p_user_id
            )
          )
          AND r.user_id != p.author_id
    ) subq
    ORDER BY sort_date DESC
    LIMIT p_limit OFFSET p_offset;
$$;

-- update get_posts to support single post lookup by id
CREATE OR REPLACE FUNCTION get_posts(
    p_user_id uuid DEFAULT NULL,
    p_author_id uuid DEFAULT NULL,
    p_post_id uuid DEFAULT NULL,
    p_include_reposts boolean DEFAULT false,
    p_limit int DEFAULT 20,
    p_offset int DEFAULT 0
)
RETURNS SETOF json LANGUAGE sql SECURITY DEFINER AS $$
    SELECT row_data FROM (
        SELECT
            p.created_at AS sort_date,
            json_build_object(
                'id',             p.id,
                'author_id',      p.author_id,
                'content',        p.content,
                'reply_to_id',    p.reply_to_id,
                'quote_of_id',    p.quote_of_id,
                'likes_count',    p.likes_count,
                'reposts_count',  p.reposts_count,
                'replies_count',  p.replies_count,
                'views_count',    p.views_count,
                'created_at',     p.created_at,
                'sort_date',      p.created_at,
                'is_repost',      false,
                'reposted_by',    NULL::text,
                'liked',          EXISTS (
                                    SELECT 1 FROM likes
                                    WHERE likes.post_id = p.id
                                    AND likes.user_id = p_user_id
                                  ),
                'reposted',       EXISTS (
                                    SELECT 1 FROM reposts
                                    WHERE reposts.post_id = p.id
                                    AND reposts.user_id = p_user_id
                                  ),
                'profiles', json_build_object(
                    'id',               pr.id,
                    'username',         pr.username,
                    'display_name',     pr.display_name,
                    'avatar_public_id', pr.avatar_public_id
                ),
                'post_media', COALESCE((
                    SELECT json_agg(pm ORDER BY pm.position)
                    FROM post_media pm
                    WHERE pm.post_id = p.id
                ), '[]'::json)
            ) AS row_data
        FROM posts p
        JOIN profiles pr ON p.author_id = pr.id
        WHERE (p_post_id IS NOT NULL OR p.reply_to_id IS NULL)
          AND (p_post_id IS NULL OR p.id = p_post_id)
          AND (p_author_id IS NULL OR p.author_id = p_author_id)

        UNION ALL

        SELECT
            r.created_at AS sort_date,
            json_build_object(
                'id',             p.id,
                'author_id',      p.author_id,
                'content',        p.content,
                'reply_to_id',    p.reply_to_id,
                'quote_of_id',    p.quote_of_id,
                'likes_count',    p.likes_count,
                'reposts_count',  p.reposts_count,
                'replies_count',  p.replies_count,
                'views_count',    p.views_count,
                'created_at',     p.created_at,
                'sort_date',      r.created_at,
                'is_repost',      true,
                'reposted_by',    rpr.username,
                'liked',          EXISTS (
                                    SELECT 1 FROM likes
                                    WHERE likes.post_id = p.id
                                    AND likes.user_id = p_user_id
                                  ),
                'reposted',       EXISTS (
                                    SELECT 1 FROM reposts
                                    WHERE reposts.post_id = p.id
                                    AND reposts.user_id = p_user_id
                                  ),
                'profiles', json_build_object(
                    'id',               pr.id,
                    'username',         pr.username,
                    'display_name',     pr.display_name,
                    'avatar_public_id', pr.avatar_public_id
                ),
                'post_media', COALESCE((
                    SELECT json_agg(pm ORDER BY pm.position)
                    FROM post_media pm
                    WHERE pm.post_id = p.id
                ), '[]'::json)
            ) AS row_data
        FROM reposts r
        JOIN posts p ON r.post_id = p.id
        JOIN profiles pr ON p.author_id = pr.id
        JOIN profiles rpr ON r.user_id = rpr.id
        WHERE p.reply_to_id IS NULL
          AND p_include_reposts = true
          AND p_author_id IS NOT NULL
          AND r.user_id = p_author_id
          AND r.user_id != p.author_id
    ) subq
    ORDER BY sort_date DESC
    LIMIT p_limit OFFSET p_offset;
$$;

CREATE OR REPLACE FUNCTION get_replies(
    p_user_id uuid DEFAULT NULL,
    p_post_id uuid DEFAULT NULL,
    p_limit int DEFAULT 20,
    p_offset int DEFAULT 0
)
RETURNS SETOF json LANGUAGE sql SECURITY DEFINER AS $$
    SELECT json_build_object(
        'id',             p.id,
        'author_id',      p.author_id,
        'content',        p.content,
        'reply_to_id',    p.reply_to_id,
        'quote_of_id',    p.quote_of_id,
        'likes_count',    p.likes_count,
        'reposts_count',  p.reposts_count,
        'replies_count',  p.replies_count,
        'views_count',    p.views_count,
        'created_at',     p.created_at,
        'is_repost',      false,
        'reposted_by',    NULL::text,
        'liked',          EXISTS (
                            SELECT 1 FROM likes
                            WHERE likes.post_id = p.id
                            AND likes.user_id = p_user_id
                          ),
        'reposted',       EXISTS (
                            SELECT 1 FROM reposts
                            WHERE reposts.post_id = p.id
                            AND reposts.user_id = p_user_id
                          ),
        'profiles', json_build_object(
            'id',               pr.id,
            'username',         pr.username,
            'display_name',     pr.display_name,
            'avatar_public_id', pr.avatar_public_id
        ),
        'post_media', COALESCE((
            SELECT json_agg(pm ORDER BY pm.position)
            FROM post_media pm
            WHERE pm.post_id = p.id
        ), '[]'::json)
    )
    FROM posts p
    JOIN profiles pr ON p.author_id = pr.id
    WHERE p.reply_to_id = p_post_id
    ORDER BY p.created_at ASC
    LIMIT p_limit OFFSET p_offset;
$$;