ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_media   ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE reposts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports      ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles: public read"
    ON profiles FOR SELECT USING (true);

CREATE POLICY "profiles: owner update"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- posts
CREATE POLICY "posts: public read"
    ON posts FOR SELECT USING (true);

CREATE POLICY "posts: authed insert"
    ON posts FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "posts: owner delete"
    ON posts FOR DELETE
    USING (auth.uid() = author_id);

-- post_media
CREATE POLICY "post_media: public read"
    ON post_media FOR SELECT USING (true);

CREATE POLICY "post_media: owner insert"
    ON post_media FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM posts
            WHERE posts.id = post_id
            AND posts.author_id = auth.uid()
        )
    );

CREATE POLICY "post_media: owner delete"
    ON post_media FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM posts
            WHERE posts.id = post_id
            AND posts.author_id = auth.uid()
        )
    );

-- likes
CREATE POLICY "likes: public read"
    ON likes FOR SELECT USING (true);

CREATE POLICY "likes: own rows"
    ON likes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- reposts
CREATE POLICY "reposts: public read"
    ON reposts FOR SELECT USING (true);

CREATE POLICY "reposts: own rows"
    ON reposts FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- follows
CREATE POLICY "follows: public read"
    ON follows FOR SELECT USING (true);

CREATE POLICY "follows: own rows"
    ON follows FOR ALL
    USING (auth.uid() = follower_id)
    WITH CHECK (auth.uid() = follower_id);

-- notifications
CREATE POLICY "notifications: recipient only"
    ON notifications FOR ALL
    USING (auth.uid() = recipient_id);

-- reports
CREATE POLICY "reports: authed insert"
    ON reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reports: own read"
    ON reports FOR SELECT
    USING (auth.uid() = reporter_id);

CREATE POLICY "reports: mod access"
    ON reports FOR ALL
    USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('moderator', 'admin')
    );