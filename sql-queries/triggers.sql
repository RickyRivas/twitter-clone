CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO profiles (id, username, provider, role)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'user_name',
            NEW.raw_user_meta_data->>'username',
            split_part(NEW.email, '@', 1)
        ),
        COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
        'user'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION handle_like_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_author_id uuid;
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        SELECT author_id INTO v_author_id FROM posts WHERE id = NEW.post_id;
        UPDATE profiles SET total_likes_count = total_likes_count + 1 WHERE id = v_author_id;
        IF NEW.user_id != v_author_id THEN
            INSERT INTO notifications (recipient_id, actor_id, type, post_id)
            VALUES (v_author_id, NEW.user_id, 'like', NEW.post_id)
            ON CONFLICT DO NOTHING;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
        SELECT author_id INTO v_author_id FROM posts WHERE id = OLD.post_id;
        UPDATE profiles SET total_likes_count = GREATEST(total_likes_count - 1, 0) WHERE id = v_author_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER on_like_change
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW EXECUTE FUNCTION handle_like_change();

CREATE OR REPLACE FUNCTION handle_repost_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_author_id uuid;
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET reposts_count = reposts_count + 1 WHERE id = NEW.post_id;
        SELECT author_id INTO v_author_id FROM posts WHERE id = NEW.post_id;
        IF NEW.user_id != v_author_id THEN
            INSERT INTO notifications (recipient_id, actor_id, type, post_id)
            VALUES (v_author_id, NEW.user_id, 'repost', NEW.post_id)
            ON CONFLICT DO NOTHING;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET reposts_count = GREATEST(reposts_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER on_repost_change
    AFTER INSERT OR DELETE ON reposts
    FOR EACH ROW EXECUTE FUNCTION handle_repost_change();

CREATE OR REPLACE FUNCTION handle_reply_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_author_id uuid;
BEGIN
    IF TG_OP = 'INSERT' AND NEW.reply_to_id IS NOT NULL THEN
        UPDATE posts SET replies_count = replies_count + 1 WHERE id = NEW.reply_to_id;
        SELECT author_id INTO v_author_id FROM posts WHERE id = NEW.reply_to_id;
        IF NEW.author_id != v_author_id THEN
            INSERT INTO notifications (recipient_id, actor_id, type, post_id)
            VALUES (v_author_id, NEW.author_id, 'reply', NEW.id)
            ON CONFLICT DO NOTHING;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.reply_to_id IS NOT NULL THEN
        UPDATE posts SET replies_count = GREATEST(replies_count - 1, 0) WHERE id = OLD.reply_to_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER on_reply_change
    AFTER INSERT OR DELETE ON posts
    FOR EACH ROW EXECUTE FUNCTION handle_reply_change();

CREATE OR REPLACE FUNCTION handle_post_count_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.reply_to_id IS NULL THEN
        UPDATE profiles SET posts_count = posts_count + 1 WHERE id = NEW.author_id;
    ELSIF TG_OP = 'DELETE' AND OLD.reply_to_id IS NULL THEN
        UPDATE profiles SET posts_count = GREATEST(posts_count - 1, 0) WHERE id = OLD.author_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER on_post_count_change
    AFTER INSERT OR DELETE ON posts
    FOR EACH ROW EXECUTE FUNCTION handle_post_count_change();

CREATE OR REPLACE FUNCTION handle_follow_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
        UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        INSERT INTO notifications (recipient_id, actor_id, type)
        VALUES (NEW.following_id, NEW.follower_id, 'follow')
        ON CONFLICT DO NOTHING;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.following_id;
        UPDATE profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER on_follow_change
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW EXECUTE FUNCTION handle_follow_change();

CREATE OR REPLACE FUNCTION handle_mention_notifications()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    mention      text;
    mentioned_id uuid;
BEGIN
    IF NEW.content IS NULL THEN RETURN NULL; END IF;
    FOR mention IN
        SELECT DISTINCT unnest(regexp_matches(NEW.content, '@([a-zA-Z0-9_]+)', 'g'))
    LOOP
        SELECT id INTO mentioned_id FROM profiles WHERE username = mention;
        IF mentioned_id IS NOT NULL AND mentioned_id != NEW.author_id THEN
            INSERT INTO notifications (recipient_id, actor_id, type, post_id)
            VALUES (mentioned_id, NEW.author_id, 'mention', NEW.id)
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
    RETURN NULL;
END;
$$;

CREATE TRIGGER on_mention
    AFTER INSERT ON posts
    FOR EACH ROW EXECUTE FUNCTION handle_mention_notifications();