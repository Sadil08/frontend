'use client';

import { useState, useEffect } from 'react';
import { Card, Tabs, Rate, Input, Button, message, List, Tag, Empty } from 'antd';
import { StarOutlined, BulbOutlined } from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';
import { reviewService, ReviewDto, ReviewSubmission } from '@/services/reviewService';
import { improvementService, ImprovementDto, ImprovementSubmission } from '@/services/improvementService';

const { TextArea } = Input;
const { TabPane } = Tabs;

export default function FeedbackPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Review state
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [myReviews, setMyReviews] = useState<ReviewDto[]>([]);

    // Improvement state
    const [improvementText, setImprovementText] = useState('');
    const [issueDescription, setIssueDescription] = useState('');
    const [myImprovements, setMyImprovements] = useState<ImprovementDto[]>([]);

    useEffect(() => {
        if (user) {
            loadReviews();
            loadImprovements();
        }
    }, [user]);

    const loadReviews = async () => {
        try {
            const reviews = await reviewService.getMyReviews();
            setMyReviews(reviews);
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    };

    const loadImprovements = async () => {
        try {
            const improvements = await improvementService.getMyImprovements();
            setMyImprovements(improvements);
        } catch (error) {
            console.error('Error loading improvements:', error);
        }
    };

    const handleSubmitReview = async () => {
        if (rating === 0) {
            message.error('Please select a rating');
            return;
        }
        if (reviewText.length < 10 || reviewText.length > 500) {
            message.error('Review must be between 10 and 500 characters');
            return;
        }

        setLoading(true);
        try {
            const data: ReviewSubmission = { rating, reviewText };
            await reviewService.submitReview(data);
            message.success('Review submitted successfully! It will be reviewed by our team.');
            setRating(0);
            setReviewText('');
            loadReviews();
        } catch (error: any) {
            message.error(error.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitImprovement = async () => {
        if (improvementText.length < 20 || improvementText.length > 1000) {
            message.error('Improvement suggestion must be between 20 and 1000 characters');
            return;
        }

        setLoading(true);
        try {
            const data: ImprovementSubmission = {
                improvementText,
                issueDescription: issueDescription || undefined,
            };
            await improvementService.submitImprovement(data);
            message.success('Improvement suggestion submitted successfully!');
            setImprovementText('');
            setIssueDescription('');
            loadImprovements();
        } catch (error) {
            message.error('Failed to submit improvement suggestion');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'green';
            case 'IMPLEMENTED': return 'green';
            case 'PENDING': return 'gold';
            case 'UNDER_REVIEW': return 'blue';
            case 'REJECTED': return 'red';
            default: return 'default';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-secondary-900 mb-2">Feedback & Improvements</h1>
                    <p className="text-secondary-600">Help us improve EduApp by sharing your experience and suggestions</p>
                </div>

                <Card>
                    <Tabs defaultActiveKey="review" size="large">
                        {/* Review Tab */}
                        <TabPane
                            tab={
                                <span>
                                    <StarOutlined />
                                    Submit Review
                                </span>
                            }
                            key="review"
                        >
                            <div className="space-y-6">
                                {/* Review Form */}
                                <div className="bg-gradient-to-br from-primary-50 to-blue-50 p-6 rounded-lg border border-primary-100">
                                    <h3 className="text-xl font-semibold text-secondary-900 mb-4">Rate Your Experience</h3>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                                            Rating
                                        </label>
                                        <Rate
                                            value={rating}
                                            onChange={setRating}
                                            style={{ fontSize: 32 }}
                                            className="text-primary-600"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                                            Your Review ({reviewText.length}/500)
                                        </label>
                                        <TextArea
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            placeholder="Share your experience with EduApp... What do you like? What helped you improve?"
                                            rows={5}
                                            maxLength={500}
                                            showCount
                                        />
                                    </div>

                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={handleSubmitReview}
                                        loading={loading}
                                        className="bg-primary-600 hover:bg-primary-700"
                                    >
                                        Submit Review
                                    </Button>
                                </div>

                                {/* My Reviews */}
                                <div>
                                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">My Reviews</h3>
                                    {myReviews.length === 0 ? (
                                        <Empty description="No reviews yet" />
                                    ) : (
                                        <List
                                            dataSource={myReviews}
                                            renderItem={(review) => (
                                                <List.Item>
                                                    <Card className="w-full">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <Rate disabled value={review.rating} className="text-sm" />
                                                            <Tag color={getStatusColor(review.status)}>{review.status}</Tag>
                                                        </div>
                                                        <p className="text-secondary-600">{review.reviewText}</p>
                                                        <p className="text-xs text-secondary-400 mt-2">
                                                            Submitted {new Date(review.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </Card>
                                                </List.Item>
                                            )}
                                        />
                                    )}
                                </div>
                            </div>
                        </TabPane>

                        {/* Improvement Tab */}
                        <TabPane
                            tab={
                                <span>
                                    <BulbOutlined />
                                    Suggest Improvements
                                </span>
                            }
                            key="improvement"
                        >
                            <div className="space-y-6">
                                {/* Improvement Form */}
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-100">
                                    <h3 className="text-xl font-semibold text-secondary-900 mb-4">Share Your Ideas</h3>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                                            Improvement Suggestion ({improvementText.length}/1000)
                                        </label>
                                        <TextArea
                                            value={improvementText}
                                            onChange={(e) => setImprovementText(e.target.value)}
                                            placeholder="How can we improve EduApp? What features would you like to see?"
                                            rows={6}
                                            maxLength={1000}
                                            showCount
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                                            Issues Faced (Optional) ({issueDescription.length}/1000)
                                        </label>
                                        <TextArea
                                            value={issueDescription}
                                            onChange={(e) => setIssueDescription(e.target.value)}
                                            placeholder="Describe any specific issues or bugs you've encountered..."
                                            rows={4}
                                            maxLength={1000}
                                            showCount
                                        />
                                    </div>

                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={handleSubmitImprovement}
                                        loading={loading}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        Submit Suggestion
                                    </Button>
                                </div>

                                {/* My Improvements */}
                                <div>
                                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">My Suggestions</h3>
                                    {myImprovements.length === 0 ? (
                                        <Empty description="No suggestions yet" />
                                    ) : (
                                        <List
                                            dataSource={myImprovements}
                                            renderItem={(improvement) => (
                                                <List.Item>
                                                    <Card className="w-full">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <Tag color={getStatusColor(improvement.status)}>{improvement.status}</Tag>
                                                        </div>
                                                        <p className="text-secondary-600 mb-2">{improvement.improvementText}</p>
                                                        {improvement.issueDescription && (
                                                            <div className="bg-gray-50 p-3 rounded mt-2">
                                                                <p className="text-xs font-medium text-secondary-700 mb-1">Issues:</p>
                                                                <p className="text-sm text-secondary-600">{improvement.issueDescription}</p>
                                                            </div>
                                                        )}
                                                        {improvement.adminNotes && (
                                                            <div className="bg-blue-50 p-3 rounded mt-2">
                                                                <p className="text-xs font-medium text-blue-700 mb-1">Admin Response:</p>
                                                                <p className="text-sm text-blue-600">{improvement.adminNotes}</p>
                                                            </div>
                                                        )}
                                                        <p className="text-xs text-secondary-400 mt-2">
                                                            Submitted {new Date(improvement.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </Card>
                                                </List.Item>
                                            )}
                                        />
                                    )}
                                </div>
                            </div>
                        </TabPane>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
}
