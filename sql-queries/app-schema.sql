CREATE TABLE post_media (
    id                      uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id                 uuid    NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    cloudinary_public_id    text    NOT NULL,
    resource_type           text    NOT NULL CHECK (resource_type IN ('image', 'video', 'raw')),
    format                  text,
    width                   int,
    height                  int,
    duration_seconds        numeric,
    position                int     NOT NULL DEFAULT 0,
    alt_text                text
);

CREATE TABLE likes (
    user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id     uuid        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at  timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE reposts (
    user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id     uuid        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at  timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE follows (
    follower_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at      timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id)
);

CREATE TABLE notifications (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    actor_id        uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type            text        NOT NULL CHECK (type IN ('like', 'repost', 'follow', 'reply', 'mention', 'quote')),
    post_id         uuid        REFERENCES posts(id) ON DELETE CASCADE,
    read            bool        NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE reports (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id         uuid        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    reporter_id     uuid        REFERENCES profiles(id) ON DELETE SET NULL,
    reason          text        NOT NULL CHECK (reason IN (
                        'spam',
                        'harassment',
                        'hate_speech',
                        'misinformation',
                        'explicit_content',
                        'violence',
                        'other'
                    )),
    details         text,
    status          text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
    reviewed_by     uuid        REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at     timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (post_id, reporter_id)
);