-- Run in the existing vse_intelligence dataset's BigQuery location.
CREATE TABLE IF NOT EXISTS `stoked-door-485816-i2.vse_intelligence.ghl_campaign_reporting` (
  brand STRING NOT NULL,
  campaign STRING NOT NULL,
  location_id STRING NOT NULL,
  workflow_id STRING NOT NULL,
  collected_at TIMESTAMP NOT NULL,
  skip_window_start TIMESTAMP NOT NULL,
  skip_window_end TIMESTAMP NOT NULL,
  sent INT64,
  delivered INT64,
  bounces INT64,
  hard_bounces INT64,
  soft_bounces INT64,
  skipped_email_actions INT64,
  email_stats_error STRING,
  workflow_logs_error STRING
)
PARTITION BY DATE(collected_at)
CLUSTER BY location_id, workflow_id;

CREATE OR REPLACE VIEW `stoked-door-485816-i2.vse_intelligence.ghl_campaign_reporting_latest` AS
SELECT *
FROM `stoked-door-485816-i2.vse_intelligence.ghl_campaign_reporting`
QUALIFY ROW_NUMBER() OVER (
  PARTITION BY location_id, workflow_id ORDER BY collected_at DESC
) = 1;
