-- =====================================================
-- SEED RATINGS DATA
-- Sample ratings and reviews for testing
-- =====================================================

-- Insert sample ratings for completed bookings that exist
DO $$
DECLARE
    booking_record RECORD;
    trip_record RECORD;
    operator_record RECORD;
    user_record RECORD;
    counter INTEGER := 0;
BEGIN
    -- Loop through existing bookings with users and create ratings
    FOR booking_record IN
        SELECT b.booking_id, b.user_id, t.trip_id, bus.operator_id
        FROM bookings b
        JOIN trips t ON b.trip_id = t.trip_id
        JOIN routes r ON t.route_id = r.route_id
        JOIN buses bus ON t.bus_id = bus.bus_id
        WHERE b.user_id = (SELECT user_id FROM users WHERE email = 'passenger@bus-ticket.com' LIMIT 1)
        AND b.status = 'completed'
        ORDER BY b.created_at DESC
        LIMIT 20
    LOOP
        counter := counter + 1;

        -- Insert rating based on counter
        IF counter = 1 THEN
            INSERT INTO ratings (
                booking_id, trip_id, operator_id, user_id,
                overall_rating, cleanliness_rating, driver_behavior_rating,
                punctuality_rating, comfort_rating, value_for_money_rating,
                review_text, photos, is_flagged, flag_reason, is_approved
            ) VALUES (
                booking_record.booking_id, booking_record.trip_id, booking_record.operator_id, booking_record.user_id,
                5, 5, 5, 5, 5, 5,
                'Excellent service! The bus was clean, driver was professional, and we arrived exactly on time. Highly recommend!',
                '["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"]',
                FALSE, NULL, TRUE
            );
        ELSIF counter = 2 THEN
            INSERT INTO ratings (
                booking_id, trip_id, operator_id, user_id,
                overall_rating, cleanliness_rating, driver_behavior_rating,
                punctuality_rating, comfort_rating, value_for_money_rating,
                review_text, photos, is_flagged, flag_reason, is_approved
            ) VALUES (
                booking_record.booking_id, booking_record.trip_id, booking_record.operator_id, booking_record.user_id,
                4, 4, 4, 5, 4, 4,
                'Good trip overall. Bus was comfortable and clean. Driver was courteous. Only minor delay but still arrived within acceptable time.',
                '[]', FALSE, NULL, TRUE
            );
        ELSIF counter = 3 THEN
            INSERT INTO ratings (
                booking_id, trip_id, operator_id, user_id,
                overall_rating, cleanliness_rating, driver_behavior_rating,
                punctuality_rating, comfort_rating, value_for_money_rating,
                review_text, photos, is_flagged, flag_reason, is_approved
            ) VALUES (
                booking_record.booking_id, booking_record.trip_id, booking_record.operator_id, booking_record.user_id,
                3, 3, 2, 4, 3, 3,
                NULL,
                '["https://example.com/photo3.jpg"]',
                FALSE, NULL, TRUE
            );
        ELSIF counter = 4 THEN
            INSERT INTO ratings (
                booking_id, trip_id, operator_id, user_id,
                overall_rating, cleanliness_rating, driver_behavior_rating,
                punctuality_rating, comfort_rating, value_for_money_rating,
                review_text, photos, is_flagged, flag_reason, is_approved
            ) VALUES (
                booking_record.booking_id, booking_record.trip_id, booking_record.operator_id, booking_record.user_id,
                2, 1, 3, 2, 2, 1,
                'Terrible experience! Bus was filthy, arrived 2 hours late, and the driver was rude. Never again!',
                '["https://example.com/photo4.jpg", "https://example.com/photo5.jpg", "https://example.com/photo6.jpg"]',
                TRUE, 'Inappropriate language in review', TRUE
            );
        ELSIF counter = 5 THEN
            INSERT INTO ratings (
                booking_id, trip_id, operator_id, user_id,
                overall_rating, cleanliness_rating, driver_behavior_rating,
                punctuality_rating, comfort_rating, value_for_money_rating,
                review_text, photos, is_flagged, flag_reason, is_approved
            ) VALUES (
                booking_record.booking_id, booking_record.trip_id, booking_record.operator_id, booking_record.user_id,
                5, 5, 5, 5, 5, 5,
                'Perfect sleeper bus experience! Comfortable bed, quiet environment, and arrived right on time. Will definitely book again.',
                '[]', FALSE, NULL, TRUE
            );
        END IF;

        -- Exit after 3 ratings to ensure some bookings have no ratings
        IF counter >= 3 THEN
            EXIT;
        END IF;
    END LOOP;

    RAISE NOTICE 'Inserted % ratings', counter;
END $$;

-- Insert additional sample ratings (matching ratings to existing completed bookings)
INSERT INTO ratings (
    booking_id, trip_id, operator_id, user_id,
    overall_rating, cleanliness_rating, driver_behavior_rating,
    punctuality_rating, comfort_rating, value_for_money_rating,
    review_text, photos, is_flagged, flag_reason, is_approved
)
SELECT
    b.booking_id,
    t.trip_id,
    o.operator_id,
    b.user_id,
    CASE WHEN b.row_num % 4 = 0 THEN 5 WHEN b.row_num % 4 = 1 THEN 4 WHEN b.row_num % 4 = 2 THEN 3 ELSE 2 END,
    CASE WHEN b.row_num % 4 = 0 THEN 5 WHEN b.row_num % 4 = 1 THEN 4 WHEN b.row_num % 4 = 2 THEN 3 ELSE 2 END,
    CASE WHEN b.row_num % 4 = 0 THEN 5 WHEN b.row_num % 4 = 1 THEN 4 WHEN b.row_num % 4 = 2 THEN 3 ELSE 2 END,
    CASE WHEN b.row_num % 4 = 0 THEN 5 WHEN b.row_num % 4 = 1 THEN 5 WHEN b.row_num % 4 = 2 THEN 4 ELSE 3 END,
    CASE WHEN b.row_num % 4 = 0 THEN 5 WHEN b.row_num % 4 = 1 THEN 4 WHEN b.row_num % 4 = 2 THEN 3 ELSE 2 END,
    CASE WHEN b.row_num % 4 = 0 THEN 5 WHEN b.row_num % 4 = 1 THEN 4 WHEN b.row_num % 4 = 2 THEN 3 ELSE 1 END,
    CASE WHEN b.row_num % 4 = 0 THEN 'Outstanding service! Highly recommend!'
         WHEN b.row_num % 4 = 1 THEN 'Good overall experience. Professional service.'
         WHEN b.row_num % 4 = 2 THEN 'Acceptable service. Met expectations.'
         ELSE 'Below average experience. Issues with cleanliness and punctuality.' END,
    '[]',
    FALSE, NULL, TRUE
FROM (
    SELECT booking_id, user_id, ROW_NUMBER() OVER (ORDER BY booking_id) as row_num
    FROM bookings
    WHERE status = 'completed'
    AND user_id = (SELECT user_id FROM users WHERE email = 'passenger@bus-ticket.com' LIMIT 1)
    AND booking_id NOT IN (SELECT booking_id FROM ratings)  -- Only bookings without ratings
    ORDER BY booking_id
    LIMIT 2  -- Only add 2 more ratings to ensure some bookings remain without ratings
) b
INNER JOIN (
    SELECT trip_id, ROW_NUMBER() OVER (ORDER BY trip_id) - 1 as trip_idx
    FROM trips
    ORDER BY trip_id
    LIMIT 20
) t ON (b.row_num - 1) % (SELECT COUNT(*) FROM trips) = t.trip_idx
INNER JOIN (
    SELECT operator_id, ROW_NUMBER() OVER (ORDER BY operator_id) - 1 as op_idx
    FROM operators
    ORDER BY operator_id
    LIMIT 4
) o ON (b.row_num - 1) % 4 = o.op_idx
ON CONFLICT (booking_id) DO NOTHING;

-- Insert additional sample ratings for google.user@bus-ticket.com
INSERT INTO ratings (
    booking_id, trip_id, operator_id, user_id,
    overall_rating, cleanliness_rating, driver_behavior_rating,
    punctuality_rating, comfort_rating, value_for_money_rating,
    review_text, photos, is_flagged, flag_reason, is_approved
)
SELECT
    b.booking_id,
    t.trip_id,
    o.operator_id,
    b.user_id,
    CASE WHEN b.row_num % 4 = 0 THEN 5 WHEN b.row_num % 4 = 1 THEN 4 WHEN b.row_num % 4 = 2 THEN 3 ELSE 2 END,
    CASE WHEN b.row_num % 4 = 0 THEN 5 WHEN b.row_num % 4 = 1 THEN 4 WHEN b.row_num % 4 = 2 THEN 3 ELSE 2 END,
    CASE WHEN b.row_num % 4 = 0 THEN 5 WHEN b.row_num % 4 = 1 THEN 4 WHEN b.row_num % 4 = 2 THEN 3 ELSE 2 END,
    CASE WHEN b.row_num % 4 = 0 THEN 5 WHEN b.row_num % 4 = 1 THEN 5 WHEN b.row_num % 4 = 2 THEN 4 ELSE 3 END,
    CASE WHEN b.row_num % 4 = 0 THEN 5 WHEN b.row_num % 4 = 1 THEN 4 WHEN b.row_num % 4 = 2 THEN 3 ELSE 2 END,
    CASE WHEN b.row_num % 4 = 0 THEN 5 WHEN b.row_num % 4 = 1 THEN 4 WHEN b.row_num % 4 = 2 THEN 3 ELSE 1 END,
    CASE WHEN b.row_num % 4 = 0 THEN 'Outstanding service! Highly recommend!'
         WHEN b.row_num % 4 = 1 THEN 'Good overall experience. Professional service.'
         WHEN b.row_num % 4 = 2 THEN 'Acceptable service. Met expectations.'
         ELSE 'Below average experience. Issues with cleanliness and punctuality.' END,
    '[]',
    FALSE, NULL, TRUE
FROM (
    SELECT booking_id, user_id, ROW_NUMBER() OVER (ORDER BY booking_id) as row_num
    FROM bookings
    WHERE status = 'completed'
    AND user_id = (SELECT user_id FROM users WHERE email = 'google.user@bus-ticket.com' LIMIT 1)
    ORDER BY booking_id
    LIMIT 10
) b
INNER JOIN (
    SELECT trip_id, ROW_NUMBER() OVER (ORDER BY trip_id) - 1 as trip_idx
    FROM trips
    ORDER BY trip_id
    LIMIT 10
) t ON (b.row_num - 1) % (SELECT COUNT(*) FROM trips) = t.trip_idx
INNER JOIN (
    SELECT operator_id, ROW_NUMBER() OVER (ORDER BY operator_id) - 1 as op_idx
    FROM operators
    ORDER BY operator_id
    LIMIT 4
) o ON (b.row_num - 1) % 4 = o.op_idx
ON CONFLICT (booking_id) DO NOTHING;

-- Insert sample rating votes
INSERT INTO rating_votes (rating_id, user_id, is_helpful)
SELECT r.rating_id, u1.user_id, TRUE
FROM (SELECT rating_id FROM ratings WHERE review_text LIKE '%Highly recommend!' LIMIT 1) r
CROSS JOIN (SELECT user_id FROM users WHERE email = 'google.user@bus-ticket.com' LIMIT 1) u1
WHERE r.rating_id IS NOT NULL
UNION ALL
SELECT r.rating_id, u2.user_id, TRUE
FROM (SELECT rating_id FROM ratings WHERE review_text LIKE '%Highly recommend!' LIMIT 1) r
CROSS JOIN (SELECT user_id FROM users WHERE email = 'admin@bus-ticket.com' LIMIT 1) u2
WHERE r.rating_id IS NOT NULL
UNION ALL
SELECT r.rating_id, u3.user_id, FALSE
FROM (SELECT rating_id FROM ratings WHERE review_text LIKE '%Highly recommend!' LIMIT 1) r
CROSS JOIN (SELECT user_id FROM users WHERE email = 'passenger@bus-ticket.com' LIMIT 1) u3
WHERE r.rating_id IS NOT NULL
UNION ALL
SELECT r.rating_id, u4.user_id, TRUE
FROM (SELECT rating_id FROM ratings WHERE review_text LIKE '%minor delay%' LIMIT 1) r
CROSS JOIN (SELECT user_id FROM users WHERE email = 'admin@bus-ticket.com' LIMIT 1) u4
WHERE r.rating_id IS NOT NULL
UNION ALL
SELECT r.rating_id, u5.user_id, TRUE
FROM (SELECT rating_id FROM ratings WHERE review_text LIKE '%minor delay%' LIMIT 1) r
CROSS JOIN (SELECT user_id FROM users WHERE email = 'passenger@bus-ticket.com' LIMIT 1) u5
WHERE r.rating_id IS NOT NULL
UNION ALL
SELECT r.rating_id, u6.user_id, FALSE
FROM (SELECT rating_id FROM ratings WHERE review_text LIKE '%Never again!' LIMIT 1) r
CROSS JOIN (SELECT user_id FROM users WHERE email = 'google.user@bus-ticket.com' LIMIT 1) u6
WHERE r.rating_id IS NOT NULL
UNION ALL
SELECT r.rating_id, u7.user_id, FALSE
FROM (SELECT rating_id FROM ratings WHERE review_text LIKE '%Never again!' LIMIT 1) r
CROSS JOIN (SELECT user_id FROM users WHERE email = 'admin@bus-ticket.com' LIMIT 1) u7
WHERE r.rating_id IS NOT NULL
UNION ALL
SELECT r.rating_id, u8.user_id, FALSE
FROM (SELECT rating_id FROM ratings WHERE review_text LIKE '%Never again!' LIMIT 1) r
CROSS JOIN (SELECT user_id FROM users WHERE email = 'passenger@bus-ticket.com' LIMIT 1) u8
WHERE r.rating_id IS NOT NULL
UNION ALL
SELECT r.rating_id, u9.user_id, TRUE
FROM (SELECT rating_id FROM ratings WHERE review_text LIKE '%Will definitely book again%' LIMIT 1) r
CROSS JOIN (SELECT user_id FROM users WHERE email = 'admin@bus-ticket.com' LIMIT 1) u9
WHERE r.rating_id IS NOT NULL
UNION ALL
SELECT r.rating_id, u10.user_id, TRUE
FROM (SELECT rating_id FROM ratings WHERE review_text LIKE '%Will definitely book again%' LIMIT 1) r
CROSS JOIN (SELECT user_id FROM users WHERE email = 'passenger@bus-ticket.com' LIMIT 1) u10
WHERE r.rating_id IS NOT NULL
UNION ALL
SELECT r.rating_id, u11.user_id, TRUE
FROM (SELECT rating_id FROM ratings WHERE review_text LIKE '%Will definitely book again%' LIMIT 1) r
CROSS JOIN (SELECT user_id FROM users WHERE email = 'google.user@bus-ticket.com' LIMIT 1) u11
WHERE r.rating_id IS NOT NULL
ON CONFLICT (rating_id, user_id) DO NOTHING;

-- Additional votes for new reviews
INSERT INTO rating_votes (rating_id, user_id, is_helpful)
SELECT r.rating_id, u1.user_id, TRUE
FROM (SELECT rating_id FROM ratings WHERE review_text LIKE '%ensure passenger comfort%' LIMIT 1) r
CROSS JOIN (SELECT user_id FROM users WHERE email = 'passenger@bus-ticket.com' LIMIT 1) u1
WHERE r.rating_id IS NOT NULL
UNION ALL
SELECT r.rating_id, u2.user_id, TRUE
FROM (SELECT rating_id FROM ratings WHERE review_text LIKE '%ensure passenger comfort%' LIMIT 1) r
CROSS JOIN (SELECT user_id FROM users WHERE email = 'google.user@bus-ticket.com' LIMIT 1) u2
WHERE r.rating_id IS NOT NULL
UNION ALL
SELECT r.rating_id, u3.user_id, TRUE
FROM (SELECT rating_id FROM ratings WHERE review_text LIKE '%Slept like a baby%' LIMIT 1) r
CROSS JOIN (SELECT user_id FROM users WHERE email = 'admin@bus-ticket.com' LIMIT 1) u3
WHERE r.rating_id IS NOT NULL
UNION ALL
SELECT r.rating_id, u4.user_id, TRUE
FROM (SELECT rating_id FROM ratings WHERE review_text LIKE '%Slept like a baby%' LIMIT 1) r
CROSS JOIN (SELECT user_id FROM users WHERE email = 'passenger@bus-ticket.com' LIMIT 1) u4
WHERE r.rating_id IS NOT NULL
UNION ALL
SELECT r.rating_id, u5.user_id, TRUE
FROM (SELECT rating_id FROM ratings WHERE review_text LIKE '%Worth every penny%' LIMIT 1) r
CROSS JOIN (SELECT user_id FROM users WHERE email = 'google.user@bus-ticket.com' LIMIT 1) u5
WHERE r.rating_id IS NOT NULL
UNION ALL
SELECT r.rating_id, u6.user_id, TRUE
FROM (SELECT rating_id FROM ratings WHERE review_text LIKE '%Worth every penny%' LIMIT 1) r
CROSS JOIN (SELECT user_id FROM users WHERE email = 'admin@bus-ticket.com' LIMIT 1) u6
WHERE r.rating_id IS NOT NULL
UNION ALL
SELECT r.rating_id, u7.user_id, TRUE
FROM (SELECT rating_id FROM ratings WHERE review_text LIKE '%Worth every penny%' LIMIT 1) r
CROSS JOIN (SELECT user_id FROM users WHERE email = 'passenger@bus-ticket.com' LIMIT 1) u7
WHERE r.rating_id IS NOT NULL
UNION ALL
SELECT r.rating_id, u8.user_id, TRUE
FROM (SELECT rating_id FROM ratings WHERE review_text LIKE '%Truly world-class transportation%' LIMIT 1) r
CROSS JOIN (SELECT user_id FROM users WHERE email = 'admin@bus-ticket.com' LIMIT 1) u8
WHERE r.rating_id IS NOT NULL
UNION ALL
SELECT r.rating_id, u9.user_id, TRUE
FROM (SELECT rating_id FROM ratings WHERE review_text LIKE '%Truly world-class transportation%' LIMIT 1) r
CROSS JOIN (SELECT user_id FROM users WHERE email = 'google.user@bus-ticket.com' LIMIT 1) u9
WHERE r.rating_id IS NOT NULL
UNION ALL
SELECT r.rating_id, u10.user_id, FALSE
FROM (SELECT rating_id FROM ratings WHERE review_text LIKE '%Mechanical issues, rude staff%' LIMIT 1) r
CROSS JOIN (SELECT user_id FROM users WHERE email = 'passenger@bus-ticket.com' LIMIT 1) u10
WHERE r.rating_id IS NOT NULL
UNION ALL
SELECT r.rating_id, u11.user_id, FALSE
FROM (SELECT rating_id FROM ratings WHERE review_text LIKE '%with the vehicle and service%' LIMIT 1) r
CROSS JOIN (SELECT user_id FROM users WHERE email = 'admin@bus-ticket.com' LIMIT 1) u11
WHERE r.rating_id IS NOT NULL
ON CONFLICT (rating_id, user_id) DO NOTHING;

-- Update helpful counts based on actual votes
UPDATE ratings
SET
    helpful_count = COALESCE(vote_counts.helpful, 0),
    unhelpful_count = COALESCE(vote_counts.unhelpful, 0)
FROM (
    SELECT
        rating_id,
        COUNT(CASE WHEN is_helpful THEN 1 END) as helpful,
        COUNT(CASE WHEN NOT is_helpful THEN 1 END) as unhelpful
    FROM rating_votes
    GROUP BY rating_id
) vote_counts
WHERE ratings.rating_id = vote_counts.rating_id;
