"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Shield,
  Zap,
  MessageSquare,
  Rocket,
  Check,
  Star,
  Quote,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
// import {
//   EscrowIcon,
//   AutomationIcon,
//   CollaborationIcon,
//   DeliveryIcon,
// } from "@/components/icons";
import { generateMetadata } from "@/lib/seo";
import { Carousel } from "@/components/ui/carousel";
import { useState } from "react";

const metadata = generateMetadata({
  title: "GridNexus - Professional Web Development Marketplace",
  description:
    "Connect with expert developers, get instant quotes, and build your dream website with secure escrow payment protection. Real-time collaboration, automated workflow, and instant delivery.",
  keywords: [
    "web development marketplace",
    "hire web developers",
    "website development service",
    "escrow payment",
    "secure freelance platform",
    "instant web quotes",
    "professional web design",
    "Ghana web development",
    "paystack integration",
    "developer marketplace",
    "tech space",
  ],
});

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-bg via-navy-950 to-slate-bg">
      {/* Header */}
      <header className="border-b border-slate-border bg-slate-panel/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/images/Grid Nexus Logo.png"
                alt="GridNexus Logo"
                width={180}
                height={50}
                className="h-12 w-auto"
                priority
              />
            </Link>
            <div className="hidden md:flex items-center gap-3">
              <Link href="/about">
                <Button
                  variant="ghost"
                  className="text-white hover:text-electric-blue"
                >
                  About
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-white hover:text-electric-blue"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-electric-blue to-electric-cyan hover:from-electric-blue/90 hover:to-electric-cyan/90 shadow-lg shadow-electric-blue/30">
                  Get Started
                </Button>
              </Link>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white hover:text-electric-blue"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-50 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-slate-panel w-full max-w-sm ml-auto h-full p-6 shadow-xl border-l border-slate-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold bg-gradient-to-r from-electric-blue to-electric-cyan bg-clip-text text-transparent">
                Menu
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-electric-blue"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-col gap-4">
              <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:text-electric-blue hover:bg-white/10"
                >
                  About
                </Button>
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:text-electric-blue hover:bg-white/10"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-electric-blue to-electric-cyan hover:from-electric-blue/90 hover:to-electric-cyan/90 shadow-lg shadow-electric-blue/30">
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-gradient-to-r from-electric-blue/20 to-electric-cyan/20 text-electric-blue border border-electric-blue/30 rounded-full text-sm font-medium">
                🚀 Professional Web Development Marketplace
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-electric-blue via-electric-cyan to-electric-light bg-clip-text text-transparent leading-tight">
              Build Your Dream Website Securely
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl">
              Connect with expert developers, get instant quotes, and launch
              your project with secure escrow payment protection. Real-time
              collaboration made simple.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="group bg-gradient-to-r from-electric-blue to-electric-cyan hover:from-electric-blue/90 hover:to-electric-cyan/90 text-lg px-8 shadow-lg shadow-electric-blue/30"
                >
                  Start Your Project
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Secure Escrow</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Real-time Chat</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Instant Delivery</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-electric-blue/20">
              <Image
                src="/images/GRiD NEXUS Premium Digital Ecosystem.png"
                alt="GridNexus Platform"
                width={600}
                height={500}
                className="w-full h-auto"
                priority
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-72 h-72 bg-electric-blue/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -top-6 -right-6 w-72 h-72 bg-electric-cyan/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Why Choose GridNexus?
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Everything you need to build, deliver, and scale your web projects
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="group p-8 rounded-2xl border-2 border-slate-border bg-slate-panel hover:border-electric-blue hover:shadow-2xl hover:shadow-electric-blue/20 transition-all duration-300">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-electric-blue/30">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Secure Escrow</h3>
            <p className="text-slate-400">
              Your payment is protected with Paystack until you&apos;re
              completely satisfied with the work
            </p>
          </div>

          <div className="group p-8 rounded-2xl border-2 border-slate-border bg-slate-panel hover:border-electric-blue hover:shadow-2xl hover:shadow-electric-blue/20 transition-all duration-300">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-electric-blue/30">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">
              Automated Workflow
            </h3>
            <p className="text-slate-400">
              From booking to delivery, everything is streamlined with smart
              tracking and notifications
            </p>
          </div>

          <div className="group p-8 rounded-2xl border-2 border-slate-border bg-slate-panel hover:border-electric-blue hover:shadow-2xl hover:shadow-electric-blue/20 transition-all duration-300">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-electric-blue/30">
              <MessageSquare className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">
              Real-time Collaboration
            </h3>
            <p className="text-slate-400">
              Live chat, screen sharing, and video calls for seamless
              communication
            </p>
          </div>

          <div className="group p-8 rounded-2xl border-2 border-slate-border bg-slate-panel hover:border-electric-blue hover:shadow-2xl hover:shadow-electric-blue/20 transition-all duration-300">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-electric-blue/30">
              <Rocket className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">
              Instant Delivery
            </h3>
            <p className="text-slate-400">
              Receive your repository and hosting access instantly upon project
              completion
            </p>
          </div>
        </div>
      </section>

      {/* Brand Showcase Section */}
      <section className="bg-gradient-to-br from-navy-950 via-navy-800 to-navy-700 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 to-electric-cyan/10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Professional Digital Solutions
              </h2>
              <p className="text-xl text-slate-300 mb-8">
                We provide comprehensive digital services including web
                development, branding, and marketing materials to help your
                business stand out.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-lg">
                    Complete brand identity and guidelines
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-lg">
                    Professional business stationery design
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-lg">
                    Social media templates and digital assets
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-lg">
                    Marketing materials and promotional content
                  </span>
                </li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="/images/GRiD NEXUS Business Stationery Mockup.png"
                  alt="Business Stationery"
                  width={300}
                  height={300}
                  className="w-full h-auto"
                />
              </div>
              <div className="rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="/images/GRiD NEXUS Social Media Templates.png"
                  alt="Social Media Templates"
                  width={300}
                  height={300}
                  className="w-full h-auto"
                />
              </div>
              <div className="rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="/images/GRiD NEXUS Digital Assets Mockup.png"
                  alt="Digital Assets"
                  width={300}
                  height={300}
                  className="w-full h-auto"
                />
              </div>
              <div className="rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="/images/GRiD NEXUS Marketing Poster Mockup.png"
                  alt="Marketing Materials"
                  width={300}
                  height={300}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              How It Works
            </h2>
            <p className="text-xl text-slate-300">
              Get your project delivered in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-electric-blue to-electric-cyan text-white flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-electric-blue/30">
                  1
                </div>
                {/* Connector line */}
                <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-electric-cyan/50 to-transparent"></div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">
                Submit Requirements
              </h3>
              <p className="text-slate-400 text-lg">
                Upload your project documentation and receive an instant
                automated quote based on complexity
              </p>
            </div>

            <div className="text-center group">
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-electric-blue to-electric-cyan text-white flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-electric-blue/30">
                  2
                </div>
                <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-electric-cyan/50 to-transparent"></div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">
                Secure Payment
              </h3>
              <p className="text-slate-400 text-lg">
                Your payment is safely held in escrow by Paystack until the work
                meets your satisfaction
              </p>
            </div>

            <div className="text-center group">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-green-500/30">
                3
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">
                Get Your Website
              </h3>
              <p className="text-slate-400 text-lg">
                Receive repository access, hosting credentials, and all
                deliverables instantly upon approval
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials & Portfolio Showcase */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              What Our Clients Say
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Real success stories from businesses we&apos;ve helped grow
            </p>
          </div>

          <Carousel autoplay interval={6000} className="max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <div className="px-8">
              <div className="bg-slate-panel rounded-3xl shadow-xl border border-slate-border p-12 mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
                <Quote className="h-12 w-12 text-electric-blue/30 mb-4" />
                <p className="text-2xl text-slate-300 mb-8 leading-relaxed">
                  &quot;GridNexus transformed our vision into reality. The
                  escrow system gave us peace of mind, and the developer
                  delivered beyond expectations. Our e-commerce platform is now
                  generating 3x more revenue!&quot;
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-electric-blue/30">
                    KA
                  </div>
                  <div>
                    <p className="font-bold text-lg text-white">Kwame Asante</p>
                    <p className="text-slate-400">CEO, ShopGhana</p>
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg bg-slate-card border-2 border-slate-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">
                        E-Commerce Dashboard
                      </p>
                      <h4 className="text-lg font-bold text-slate-900">
                        ShopGhana Analytics
                      </h4>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-600 mb-1">Total Sales</p>
                      <p className="text-xl font-bold text-blue-900">
                        GH₵ 45.2K
                      </p>
                      <p className="text-xs text-green-600">↑ 23% this month</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-600 mb-1">Orders</p>
                      <p className="text-xl font-bold text-purple-900">1,429</p>
                      <p className="text-xs text-green-600">↑ 12% growth</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full w-[85%] bg-gradient-to-r from-blue-500 to-purple-600"></div>
                      </div>
                      <span className="text-xs font-semibold text-slate-600">
                        85%
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Active conversion rate
                    </p>
                  </div>
                </div>

                <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg bg-white border-2 border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">
                        Mobile App Interface
                      </p>
                      <h4 className="text-lg font-bold text-slate-900">
                        ShopGhana Mobile
                      </h4>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                      <Rocket className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                      <div className="flex-1">
                        <div className="h-2 w-24 bg-slate-200 rounded mb-1"></div>
                        <div className="h-2 w-16 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600"></div>
                      <div className="flex-1">
                        <div className="h-2 w-28 bg-slate-200 rounded mb-1"></div>
                        <div className="h-2 w-20 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <div className="flex-1 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
                      <div className="w-8 h-8 border-2 border-slate-200 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="px-8">
              <div className="bg-white rounded-3xl shadow-xl p-12 mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
                <Quote className="h-12 w-12 text-blue-200 mb-4" />
                <p className="text-2xl text-slate-700 mb-8 leading-relaxed">
                  &quot;The real-time collaboration tools were game-changing. We
                  could see progress daily and provide feedback instantly. Our
                  mobile app launched on time and our users love it!&quot;
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xl font-bold">
                    AM
                  </div>
                  <div>
                    <p className="font-bold text-lg">Ama Mensah</p>
                    <p className="text-slate-600">Founder, TechEducate Ghana</p>
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg bg-white border-2 border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">
                        Learning Management System
                      </p>
                      <h4 className="text-lg font-bold text-slate-900">
                        TechEducate Portal
                      </h4>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <Rocket className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-purple-50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-purple-900">5.2K</p>
                      <p className="text-xs text-purple-600">Students</p>
                    </div>
                    <div className="bg-pink-50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-pink-900">142</p>
                      <p className="text-xs text-pink-600">Courses</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-green-900">4.9★</p>
                      <p className="text-xs text-green-600">Rating</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600">Course Progress</span>
                      <span className="text-slate-900 font-semibold">72%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-[72%] bg-gradient-to-r from-purple-500 to-pink-600"></div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <div className="flex-1 h-1 bg-purple-300 rounded"></div>
                      <div className="flex-1 h-1 bg-purple-300 rounded"></div>
                      <div className="flex-1 h-1 bg-slate-200 rounded"></div>
                      <div className="flex-1 h-1 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg bg-white border-2 border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">
                        Mobile Learning App
                      </p>
                      <h4 className="text-lg font-bold text-slate-900">
                        TechEducate Mobile
                      </h4>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        WD
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-900 mb-1">
                          Web Development
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1 flex-1 bg-slate-200 rounded-full">
                            <div className="h-full w-[85%] bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                          </div>
                          <span className="text-xs text-slate-600">85%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                        UI
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-900 mb-1">
                          UI/UX Design
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1 flex-1 bg-slate-200 rounded-full">
                            <div className="h-full w-[60%] bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
                          </div>
                          <span className="text-xs text-slate-600">60%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="px-8">
              <div className="bg-white rounded-3xl shadow-xl p-12 mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
                <Quote className="h-12 w-12 text-blue-200 mb-4" />
                <p className="text-2xl text-slate-700 mb-8 leading-relaxed">
                  &quot;Professional, secure, and efficient. GridNexus connected
                  us with a talented developer who understood our business
                  needs. The payment system made everything transparent and
                  fair.&quot;
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold">
                    JO
                  </div>
                  <div>
                    <p className="font-bold text-lg">John Owusu</p>
                    <p className="text-slate-600">
                      Director, FinServe Solutions
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg bg-white border-2 border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">
                        Financial Dashboard
                      </p>
                      <h4 className="text-lg font-bold text-slate-900">
                        FinServe Analytics
                      </h4>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                      <Rocket className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-slate-900 mb-1">
                      $284,291
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-green-600 font-semibold">
                        ↑ 18.5%
                      </span>
                      <span className="text-xs text-slate-500">
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 items-end h-16">
                    <div className="flex-1 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t h-[60%]"></div>
                    <div className="flex-1 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t h-[45%]"></div>
                    <div className="flex-1 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t h-[75%]"></div>
                    <div className="flex-1 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t h-[90%]"></div>
                    <div className="flex-1 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t h-[100%]"></div>
                    <div className="flex-1 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t h-[85%]"></div>
                  </div>
                </div>
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg bg-white border-2 border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">
                        Account Overview
                      </p>
                      <h4 className="text-lg font-bold text-slate-900">
                        Client Accounts
                      </h4>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div>
                        <p className="text-xs text-blue-600 mb-1">
                          Checking Account
                        </p>
                        <p className="text-lg font-bold text-blue-900">
                          $12,432.58
                        </p>
                      </div>
                      <div className="text-green-600 text-sm font-semibold">
                        +5.2%
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div>
                        <p className="text-xs text-purple-600 mb-1">
                          Savings Account
                        </p>
                        <p className="text-lg font-bold text-purple-900">
                          $45,821.92
                        </p>
                      </div>
                      <div className="text-green-600 text-sm font-semibold">
                        +8.1%
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                      <div>
                        <p className="text-xs text-green-600 mb-1">
                          Investment Portfolio
                        </p>
                        <p className="text-lg font-bold text-green-900">
                          $128,542.16
                        </p>
                      </div>
                      <div className="text-green-600 text-sm font-semibold">
                        +12.4%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Carousel>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-800 to-navy-700"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 to-electric-cyan/10"></div>
        <div className="relative container mx-auto px-4 py-24 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join hundreds of satisfied clients who&apos;ve built their dream
            websites with GridNexus. Start your project today!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-electric-blue to-electric-cyan hover:from-electric-blue/90 hover:to-electric-cyan/90 text-white text-lg px-10 py-6 h-auto font-semibold shadow-lg shadow-electric-blue/30"
              >
                Create Your Account
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-electric-blue text-electric-blue hover:bg-electric-blue/10 text-lg px-10 py-6 h-auto font-semibold"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Image
                src="/images/Grid Nexus Logo.png"
                alt="GridNexus Logo"
                width={150}
                height={40}
                className="h-10 w-auto mb-4 brightness-0 invert"
              />
              <p className="text-slate-400">
                Professional web development marketplace with secure escrow
                protection.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Platform</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link
                    href="/signup"
                    className="hover:text-white transition-colors"
                  >
                    Get Started
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>
              &copy; 2026 GridNexus. All rights reserved. Built with for
              clients.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
