-- Add payment_type field to payments table for split payments
-- This enables 60% upfront + 40% on completion payment model

ALTER TABLE payments 
ADD COLUMN payment_type VARCHAR(20) DEFAULT 'full' 
CHECK (payment_type IN ('full', 'initial', 'final'));

-- Add comment to explain the field
COMMENT ON COLUMN payments.payment_type IS 'Type of payment: full (100%), initial (60%), or final (40%)';

-- Update existing payments to be 'full' type
UPDATE payments SET payment_type = 'full' WHERE payment_type IS NULL;
