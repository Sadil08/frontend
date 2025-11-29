"use client";

import { 
  RocketOutlined, 
  HeartOutlined, 
  TeamOutlined, 
  BulbOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  SafetyOutlined,
  GlobalOutlined
} from '@ant-design/icons';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 animate-fade-in">
            About EduApp
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto animate-slide-up">
            Revolutionizing exam preparation with AI-powered feedback and affordable pricing
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h2 className="text-4xl font-bold text-secondary-900 mb-6">Our Mission</h2>
              <p className="text-lg text-secondary-600 leading-relaxed mb-4">
                At EduApp, we believe that quality education should be accessible to everyone, 
                regardless of their financial background. Our mission is to democratize exam 
                preparation by providing cutting-edge AI-powered tools at prices that won't 
                break the bank.
              </p>
              <p className="text-lg text-secondary-600 leading-relaxed">
                We're committed to helping students achieve their academic goals through 
                personalized feedback, comprehensive practice materials, and innovative 
                technology that adapts to each learner's unique needs.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 p-8 rounded-2xl shadow-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <RocketOutlined className="text-3xl text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-secondary-900">10K+</h3>
                  <p className="text-secondary-600">Students</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrophyOutlined className="text-3xl text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-secondary-900">50K+</h3>
                  <p className="text-secondary-600">Papers Attempted</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ThunderboltOutlined className="text-3xl text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-secondary-900">95%</h3>
                  <p className="text-secondary-600">Satisfaction Rate</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <GlobalOutlined className="text-3xl text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-secondary-900">24/7</h3>
                  <p className="text-secondary-600">AI Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">Our Story</h2>
            <p className="text-xl text-secondary-600">How EduApp came to be</p>
          </div>
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <p className="text-lg text-secondary-600 leading-relaxed mb-6">
              EduApp was founded in 2024 by a team of educators and technologists who were 
              frustrated with the high costs and limited effectiveness of traditional exam 
              preparation resources. We saw students struggling to afford expensive tutoring 
              and practice materials, while those who could afford them often received generic 
              feedback that didn't address their specific weaknesses.
            </p>
            <p className="text-lg text-secondary-600 leading-relaxed mb-6">
              We knew there had to be a better way. By combining our expertise in education, 
              artificial intelligence, and software development, we created EduApp—a platform 
              that provides personalized, AI-powered feedback at a fraction of the cost of 
              traditional alternatives.
            </p>
            <p className="text-lg text-secondary-600 leading-relaxed">
              Today, we're proud to serve thousands of students, teachers, and parents who 
              trust us to help them achieve their academic goals. Our AI technology continues 
              to evolve, learning from every interaction to provide even better feedback and 
              support.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-secondary-600">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Value 1 */}
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-primary-50 rounded-2xl shadow-sm hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartOutlined className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Accessibility</h3>
              <p className="text-secondary-600">
                Quality education should be affordable and accessible to everyone, everywhere.
              </p>
            </div>

            {/* Value 2 */}
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BulbOutlined className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Innovation</h3>
              <p className="text-secondary-600">
                We continuously push boundaries with AI technology to deliver better learning experiences.
              </p>
            </div>

            {/* Value 3 */}
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-sm hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TeamOutlined className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Student-Centric</h3>
              <p className="text-secondary-600">
                Every decision we make is guided by what's best for our students and their success.
              </p>
            </div>

            {/* Value 4 */}
            <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafetyOutlined className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Integrity</h3>
              <p className="text-secondary-600">
                We maintain the highest standards of honesty, transparency, and ethical conduct.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">What Makes Us Different</h2>
            <p className="text-xl text-secondary-600">Why students choose EduApp over other platforms</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-2xl font-bold text-secondary-900 mb-4">AI-Powered Personalization</h3>
              <p className="text-secondary-600 leading-relaxed">
                Unlike generic feedback systems, our AI analyzes each student's unique strengths 
                and weaknesses, providing tailored recommendations that actually help improve grades.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-2xl font-bold text-secondary-900 mb-4">Transparent Pricing</h3>
              <p className="text-secondary-600 leading-relaxed">
                No hidden fees, no subscription traps. Pay only for what you need, when you need it. 
                Our prices are up to 70% lower than traditional tutoring services.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-2xl font-bold text-secondary-900 mb-4">Proven Results</h3>
              <p className="text-secondary-600 leading-relaxed">
                Our students see an average grade improvement of 15-20% within the first month. 
                Real results, backed by data and testimonials from thousands of satisfied users.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            Join Our Growing Community
          </h2>
          <p className="text-xl text-primary-100 mb-10 animate-slide-up">
            Be part of the education revolution. Start your journey to academic excellence today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <a 
              href="/register" 
              className="px-8 py-4 bg-white text-primary-900 rounded-full font-bold text-lg hover:bg-primary-50 transition-all shadow-lg hover:shadow-2xl hover:scale-105 transform"
            >
              Get Started Free
            </a>
            <a 
              href="/bundles" 
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-primary-900 transition-all shadow-lg"
            >
              Browse Papers
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
