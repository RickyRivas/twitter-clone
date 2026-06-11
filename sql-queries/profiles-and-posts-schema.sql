CREATE TABLE profiles (
    id                  uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username            text        UNIQUE NOT NULL,
    display_name        text,
    bio                 text,
    avatar_public_id    text,
    banner_public_id    text,
    website             text,
    location            text,
    provider            text        NOT NULL DEFAULT 'email',
    role                text        NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    badge               text,
    pinned_post_id      uuid,
    followers_count     int         NOT NULL DEFAULT 0,
    following_count     int         NOT NULL DEFAULT 0,
    posts_count         int         NOT NULL DEFAULT 0,
    total_likes_count   int         NOT NULL DEFAULT 0,
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE posts (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id       uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content         text        CHECK (char_length(content) <= 280),
    content_tsv     tsvector    GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, ''))) STORED,
    reply_to_id     uuid        REFERENCES posts(id) ON DELETE SET NULL,
    quote_of_id     uuid        REFERENCES posts(id) ON DELETE SET NULL,
    likes_count     int         NOT NULL DEFAULT 0,
    reposts_count   int         NOT NULL DEFAULT 0,
    replies_count   int         NOT NULL DEFAULT 0,
    views_count     int         NOT NULL DEFAULT 0,
    link_url        text,
    link_title      text,
    link_image_url  text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles
    ADD CONSTRAINT profiles_pinned_post_id_fkey
    FOREIGN KEY (pinned_post_id) REFERENCES posts(id) ON DELETE SET NULL;