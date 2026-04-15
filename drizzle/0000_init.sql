CREATE TYPE channel_status AS ENUM ('active', 'paused');
CREATE TYPE video_status AS ENUM ('draft', 'queued', 'processing', 'complete', 'failed');
CREATE TYPE generation_step AS ENUM ('queued', 'scripting', 'captions', 'assembling', 'complete');

CREATE TABLE channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  name text NOT NULL,
  platform text NOT NULL,
  status channel_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  channel_id uuid NOT NULL REFERENCES channels(id),
  name text NOT NULL,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  series_id uuid NOT NULL REFERENCES series(id),
  topic text NOT NULL,
  title text NOT NULL,
  script_text text NOT NULL,
  caption_text text NOT NULL,
  status video_status NOT NULL DEFAULT 'draft',
  generation_step generation_step NOT NULL DEFAULT 'queued',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES videos(id),
  user_id text NOT NULL,
  status generation_step NOT NULL DEFAULT 'queued',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
