"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  RocketOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  BookOutlined,
  TeamOutlined,
  SafetyOutlined
} from '@ant-design/icons';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Master Your Exams with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-blue-300">
                AI-Powered
              </span>{' '}
              Feedback
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto mb-10 animate-slide-up">
              Access premium past papers, practice exams, and get instant AI-powered feedback
              to identify your weaknesses and improve your grades faster than ever before.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {!user ? (
                <>
                  <Link
                    href="/register"
                    className="px-8 py-4 bg-white text-primary-900 rounded-full font-bold text-lg hover:bg-primary-50 transition-all shadow-lg hover:shadow-2xl hover:scale-105 transform"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/bundles"
                    className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-primary-900 transition-all shadow-lg"
                  >
                    Browse Papers
                  </Link>
                </>
              ) : (
                <Link
                  href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  className="px-8 py-4 bg-white text-primary-900 rounded-full font-bold text-lg hover:bg-primary-50 transition-all shadow-lg hover:shadow-2xl hover:scale-105 transform"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
              Why Choose EduApp?
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              We're revolutionizing exam preparation with cutting-edge AI technology and affordable pricing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: AI Feedback */}
            <div className="group bg-gradient-to-br from-blue-50 to-primary-50 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-blue-100 hover:border-primary-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ThunderboltOutlined className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-secondary-900 mb-4">Advanced AI Feedback</h3>
              <p className="text-secondary-600 leading-relaxed">
                Get detailed, personalized feedback on every answer. Our AI analyzes your responses and provides
                specific suggestions on what to improve, which topics to review, and how to structure better answers.
              </p>
            </div>

            {/* Feature 2: Affordable Pricing */}
            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-green-100 hover:border-green-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <DollarOutlined className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-secondary-900 mb-4">Unbeatable Pricing</h3>
              <p className="text-secondary-600 leading-relaxed">
                Quality education shouldn't break the bank. Our bundles are priced significantly lower than
                competitors while offering superior AI-powered features that others charge premium prices for.
              </p>
            </div>

            {/* Feature 3: Comprehensive Coverage */}
            <div className="group bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-purple-100 hover:border-purple-300 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOutlined className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-secondary-900 mb-4">Comprehensive Coverage</h3>
              <p className="text-secondary-600 leading-relaxed">
                Access thousands of past papers, practice questions, and mock exams across all major subjects.
                From MCQs to essays, we've got everything you need to ace your exams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Get started in minutes and see results immediately
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <div className="absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary-300 to-transparent hidden md:block"></div>
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Browse & Select</h3>
              <p className="text-secondary-600">
                Choose from our extensive library of past papers and practice bundles
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <div className="absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-green-300 to-transparent hidden md:block"></div>
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Purchase Bundle</h3>
              <p className="text-secondary-600">
                Get instant access to all papers in the bundle at an affordable price
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <div className="absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-300 to-transparent hidden md:block"></div>
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Attempt Papers</h3>
              <p className="text-secondary-600">
                Take the exam under timed conditions just like the real thing
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-3xl font-bold text-white">4</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Get AI Feedback</h3>
              <p className="text-secondary-600">
                Receive detailed feedback and personalized improvement suggestions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
              Perfect For Everyone
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Whether you're a student, teacher, or parent, EduApp has something for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* For Students */}
            <div className="bg-gradient-to-br from-blue-50 to-primary-50 p-8 rounded-2xl shadow-sm border border-blue-100 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <RocketOutlined className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-secondary-900 mb-4">For Students</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircleOutlined className="text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-secondary-600">Improve grades with targeted AI feedback</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleOutlined className="text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-secondary-600">Practice with real past papers</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleOutlined className="text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-secondary-600">Track progress and identify weak areas</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleOutlined className="text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-secondary-600">Compete on leaderboards</span>
                </li>
              </ul>
            </div>

            {/* For Teachers */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-sm border border-green-100 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <TeamOutlined className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-secondary-900 mb-4">For Teachers</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircleOutlined className="text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-secondary-600">Assign papers to students easily</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleOutlined className="text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-secondary-600">Monitor student performance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleOutlined className="text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-secondary-600">Save time with AI-powered grading</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleOutlined className="text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-secondary-600">Access comprehensive question banks</span>
                </li>
              </ul>
            </div>

            {/* For Parents */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-sm border border-purple-100 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <SafetyOutlined className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-secondary-900 mb-4">For Parents</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircleOutlined className="text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-secondary-600">Track your child's progress</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleOutlined className="text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-secondary-600">Affordable alternative to tutoring</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleOutlined className="text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-secondary-600">Safe and secure platform</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleOutlined className="text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-secondary-600">See detailed performance reports</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Highlight Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="animate-slide-up">
            <TrophyOutlined className="text-6xl mb-6 text-primary-200" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Premium Features at Fraction of the Cost
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              While other platforms charge premium prices for basic features, we offer advanced AI-powered
              feedback, comprehensive past papers, and detailed analytics at prices that won't break the bank.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/bundles"
                className="px-8 py-4 bg-white text-primary-900 rounded-full font-bold text-lg hover:bg-primary-50 transition-all shadow-lg hover:shadow-2xl hover:scale-105 transform"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
              Ready to Ace Your Exams?
            </h2>
            <p className="text-xl text-secondary-600 mb-10">
              Join thousands of students who are already improving their grades with EduApp
            </p>
            {!user ? (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-full font-bold text-lg hover:from-primary-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-2xl hover:scale-105 transform"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/bundles"
                  className="px-8 py-4 bg-white border-2 border-primary-600 text-primary-600 rounded-full font-bold text-lg hover:bg-primary-50 transition-all shadow-lg"
                >
                  Browse Papers
                </Link>
              </div>
            ) : (
              <Link
                href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-full font-bold text-lg hover:from-primary-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-2xl hover:scale-105 transform"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
