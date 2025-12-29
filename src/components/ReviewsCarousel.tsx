'use client';

import { useState, useEffect } from 'react';
import { Rate, Card } from 'antd';
import { LeftOutlined, RightOutlined, StarFilled } from '@ant-design/icons';
import { reviewService, PublicReviewDto } from '@/services/reviewService';

export default function ReviewsCarousel() {
    const [reviews, setReviews] = useState<PublicReviewDto[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {
            const data = await reviewService.getPublicReviews(15);
            setReviews(data);
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? reviews.length - 3 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev >= reviews.length - 3 ? 0 : prev + 1));
    };

    if (loading || reviews.length === 0) {
        return null;
    }

    const visibleReviews = reviews.slice(currentIndex, currentIndex + 3);

    return (
        <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {visibleReviews.map((review, index) => (
                    <Card
                        key={currentIndex + index}
                        className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                    >
                        {/* Star Rating */}
                        <div className="flex items-center justify-center mb-4">
                            <Rate
                                disabled
                                value={review.rating}
                                className="text-yellow-400"
                                style={{ fontSize: 20 }}
                                character={<StarFilled />}
                            />
                        </div>

                        {/* Review Text */}
                        <p className="text-secondary-600 text-center leading-relaxed mb-4 min-h-[80px]">
                            "{review.reviewText}"
                        </p>

                        {/* User Name */}
                        <div className="text-center border-t border-gray-100 pt-4">
                            <p className="font-semibold text-secondary-900">{review.userName}</p>
                            <p className="text-xs text-secondary-400 mt-1">
                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Navigation Arrows */}
            {reviews.length > 3 && (
                <>
                    <button
                        onClick={handlePrevious}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-50 transition-colors"
                        aria-label="Previous reviews"
                    >
                        <LeftOutlined className="text-primary-600" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-50 transition-colors"
                        aria-label="Next reviews"
                    >
                        <RightOutlined className="text-primary-600" />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {reviews.length > 3 && (
                <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: Math.ceil(reviews.length / 3) }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index * 3)}
                            className={`w-2 h-2 rounded-full transition-all ${Math.floor(currentIndex / 3) === index
                                    ? 'bg-primary-600 w-6'
                                    : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
