import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import {
  Zap,
  Droplets,
  Wrench,
  Shield,
  Clock,
  MapPin,
  Star,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
const API = import.meta.env.VITE_API_URL;

const carouselImages = [
  {
    url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1920",
    title: "Expert Electrical Services",
    subtitle: "Safe and reliable solutions for your home",
  },
  {
    url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1920",
    title: "Professional Plumbing",
    subtitle: "From leaks to complete installations",
  },
  {
    url: "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=1920",
    title: "Quality Home Maintenance",
    subtitle: "Keeping your home in perfect condition",
  },
];

const services = [
  {
    icon: <Zap className="text-yellow-500" />,
    title: "Electrical",
    desc: "Expert wiring, repairs, and installations by certified electricians.",
    features: ["Short circuit repair", "New wiring", "Appliance install"],
  },
  {
    icon: <Droplets className="text-blue-500" />,
    title: "Plumbing",
    desc: "Leak fixes, pipe installs, and complete bathroom solutions.",
    features: ["Pipe leakage", "Tap repair", "Drain cleaning"],
  },
  {
    icon: <Wrench className="text-orange-500" />,
    title: "Home Repair",
    desc: "General maintenance and fixes for every corner of your house.",
    features: ["Furniture repair", "Wall painting", "Door fixes"],
  },
];

const stats = [
  { label: "Service Area", value: "Kannur", icon: <MapPin /> },
  { label: "Availability", value: "24/7", icon: <Clock /> },
  { label: "Verified Workers", value: "50+", icon: <Shield /> },
  { label: "Customer Rating", value: "4.9/5", icon: <Star /> },
];

export const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pt-16 overflow-hidden">
      {/* Hero Carousel Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-0"
          >
            <div className="absolute inset-0 bg-black/50 z-10" />
            <img
              src={carouselImages[currentSlide].url}
              alt="Hero"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>

        <div className="max-w-7xl mx-auto text-center z-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-8xl font-bold mb-6 leading-tight text-white">
              {carouselImages[currentSlide].title}
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Anytime, Anywhere
              </span>
            </h1>
            <p className="text-xl text-zinc-200 mb-10 max-w-2xl mx-auto font-medium">
              {carouselImages[currentSlide].subtitle}. Professional, verified,
              and fast home services in Kannur.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full px-12 py-7 text-lg rounded-full shadow-2xl shadow-blue-500/20"
                >
                  Book Now
                </Button>
              </Link>
              <Link to="/emergency" className="w-full sm:w-auto">
                <Button
                  variant="danger"
                  size="lg"
                  className="w-full px-12 py-7 text-lg rounded-full animate-glow shadow-2xl shadow-red-500/20"
                >
                  Emergency Help
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Carousel Controls */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {carouselImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentSlide === idx
                  ? "bg-white w-10"
                  : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white dark:bg-zinc-950 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 hover:shadow-xl transition-all"
              >
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                  {React.cloneElement(stat.icon as React.ReactElement, {
                    size: 32,
                  })}
                </div>
                <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 px-4 bg-zinc-50 dark:bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Our Premium Services
            </h2>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
              We bring professional expertise to your doorstep with guaranteed
              satisfaction.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="group h-full p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-none bg-white dark:bg-zinc-900">
                  <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl flex items-center justify-center mb-8 text-4xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                  <p className="text-zinc-500 mb-8 leading-relaxed">
                    {service.desc}
                  </p>

                  <ul className="space-y-3 mb-10">
                    {service.features.map((feature, fIdx) => (
                      <li
                        key={fIdx}
                        className="flex items-center gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-400"
                      >
                        <CheckCircle2 size={18} className="text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/register"
                    className="inline-flex items-center gap-3 text-blue-600 font-bold group-hover:gap-5 transition-all"
                  >
                    Book This Service <ChevronRight size={20} />
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
                  S
                </div>
                <span className="font-black text-2xl tracking-tighter">
                  SPARK LIGHT
                </span>
              </div>
              <p className="text-zinc-500 text-lg max-w-sm leading-relaxed">
                Redefining home maintenance in Kannur with 24/7 priority
                emergency support and verified professional expertise.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-zinc-400">
                Services
              </h4>
              <ul className="space-y-4 font-medium">
                <li>
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    Electrical
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    Plumbing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    Home Repair
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    Emergency
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-zinc-400">
                Company
              </h4>
              <ul className="space-y-4 font-medium">
                <li>
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-zinc-100 dark:border-zinc-900 flex flex-col md:row justify-between items-center gap-6">
            <p className="text-zinc-400 text-sm font-medium">
              © 2026 Spark Light. Crafted for excellence in Kannur.
            </p>
            <div className="flex gap-8">
              {/* Social placeholders */}
              <div className="w-5 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              <div className="w-5 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              <div className="w-5 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
