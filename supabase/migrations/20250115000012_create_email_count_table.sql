-- Create email count tracking table
CREATE TABLE public.totalemailcounttable (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  total_count integer NULL DEFAULT 0,
  user_id character varying NULL,
  email_limit integer NULL DEFAULT 125,
  CONSTRAINT totalemailcounttable_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Create index on user_id for fast lookups
CREATE INDEX idx_totalemailcounttable_user_id ON public.totalemailcounttable(user_id);

-- Enable RLS
ALTER TABLE public.totalemailcounttable ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own email count" ON public.totalemailcounttable
FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own email count" ON public.totalemailcounttable
FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own email count" ON public.totalemailcounttable
FOR UPDATE USING (user_id = auth.uid()::text);

-- Grant permissions
GRANT ALL ON public.totalemailcounttable TO authenticated;
GRANT ALL ON public.totalemailcounttable TO service_role; 