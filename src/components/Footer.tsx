import Link from 'next/link';
import { FacebookOutlined, TwitterOutlined, InstagramOutlined, LinkedinOutlined } from '@ant-design/icons';

const Footer = () => {
    return (
        <footer className="bg-secondary-900 text-secondary-300 py-12 border-t border-secondary-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <h3 className="text-white text-lg font-bold mb-4">EduApp</h3>
                        <p className="text-sm leading-relaxed mb-4">
                            Empowering students with the best tools for exam preparation and learning.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-secondary-400 hover:text-white transition-colors">
                                <FacebookOutlined style={{ fontSize: '20px' }} />
                            </a>
                            <a href="#" className="text-secondary-400 hover:text-white transition-colors">
                                <TwitterOutlined style={{ fontSize: '20px' }} />
                            </a>
                            <a href="#" className="text-secondary-400 hover:text-white transition-colors">
                                <InstagramOutlined style={{ fontSize: '20px' }} />
                            </a>
                            <a href="#" className="text-secondary-400 hover:text-white transition-colors">
                                <LinkedinOutlined style={{ fontSize: '20px' }} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Resources</h4>
                        <ul className="space-y-2">
                            <li><Link href="/papers" className="hover:text-white transition-colors">Past Papers</Link></li>
                            <li><Link href="/bundles" className="hover:text-white transition-colors">Bundles</Link></li>
                            <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Contact</h4>
                        <ul className="space-y-2">
                            <li>Email: support@eduapp.com</li>
                            <li>Phone: +1 (555) 123-4567</li>
                            <li>Address: 123 Education Lane, Learning City</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-secondary-800 mt-12 pt-8 text-sm text-center">
                    &copy; {new Date().getFullYear()} EduApp. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
