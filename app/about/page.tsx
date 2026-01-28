"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Users, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
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
            <div className="flex items-center gap-3">
              <Link href="/about">
                <Button variant="ghost" className="font-semibold">
                  About
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            About GridNexus
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Revolutionizing how clients and developers connect, collaborate, and
            create amazing web solutions
          </p>
        </div>
      </section>

      {/* Brand Foundation Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Our Brand Story</h2>
            <p className="text-lg text-slate-600 mb-4">
              GridNexus was born from a simple idea: to create a marketplace
              where clients can safely commission web development projects
            </p>
            <p className="text-lg text-slate-600 mb-4">
              We recognized a critical gap in the industry—a lack of trust and
              security between clients and developers. That&apos;s why we built
              GridNexus with escrow protection, transparent workflows, and
              real-time collaboration at its core.
            </p>
            <p className="text-lg text-slate-600 mb-6">
              Today, GridNexus is the go-to platform for businesses seeking
              professional web development
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Join Our Community
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/images/GRiD NEXUS Premium Brand Foundation.png"
              alt="Brand Foundation"
              width={500}
              height={400}
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
              <div className="h-14 w-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Trust & Security
              </h3>
              <p className="text-blue-100">
                Every transaction is protected with industry-leading escrow and
                encryption
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
              <div className="h-14 w-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Speed & Efficiency
              </h3>
              <p className="text-blue-100">
                Automated workflows get projects moving faster than ever before
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
              <div className="h-14 w-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Community First
              </h3>
              <p className="text-blue-100">
                We empower both clients and developers to succeed together
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
              <div className="h-14 w-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Target className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Excellence</h3>
              <p className="text-blue-100">
                We&apos;re committed to delivering world-class solutions consistently
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Guidelines Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">
          Our Professional Standards
        </h2>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/images/GRiD NEXUS Brand Guidelines Showcase.png"
              alt="Brand Guidelines"
              width={500}
              height={400}
              className="w-full h-auto"
            />
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-6">Consistent Excellence</h3>
            <p className="text-lg text-slate-600 mb-4">
              Every interaction on GridNexus is designed with purpose and care.
              Our brand guidelines ensure consistency across all platforms and
              touchpoints.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span className="text-slate-600">
                  Professional design standards
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span className="text-slate-600">
                  Clear communication principles
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span className="text-slate-600">
                  Accessible and inclusive interfaces
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span className="text-slate-600">Security-first approach</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Digital Ecosystem Section */}
      <section className="bg-slate-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Our Digital Ecosystem
          </h2>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">
                Complete Platform Suite
              </h3>
              <p className="text-lg text-slate-600 mb-4">
                GridNexus provides everything needed for successful project
                delivery:
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Client Portal</h4>
                    <p className="text-slate-600">
                      Submit projects, track progress, manage payments
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/GRiD NEXUS Premium Digital Ecosystem.png"
                alt="Digital Ecosystem"
                width={500}
                height={400}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Be Part of the Revolution
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied clients and developers building the
            future of web development
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-10 py-6 h-auto font-semibold"
              >
                Get Started Now
              </Button>
            </Link>
            <Link href="/">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-blue hover:bg-white/10 text-lg px-10 py-6 h-auto font-semibold"
              >
                Back to Home
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
              &copy; 2026 GridNexus. All rights reserved. Built for clients and
              developers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
