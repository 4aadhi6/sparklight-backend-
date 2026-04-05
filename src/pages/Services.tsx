import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Zap, Droplets, Wrench, Shield, Clock, Star, ChevronRight, Hammer, Paintbrush, Lightbulb, Thermometer, Lock, Wifi, CheckCircle2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const serviceCarousel = [
  {
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1920',
    title: 'Reliable Home Solutions',
    subtitle: 'Quality service you can trust'
  },
  {
    url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=1920',
    title: '24/7 Professional Support',
    subtitle: 'Always here when you need us'
  }
];

const allServices = [
  { 
    category: 'Electrical',
    icon: <Zap className="text-yellow-500" />,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800',
    items: [
      { title: 'Wiring & Rewiring', desc: 'Complete home wiring solutions for safety and efficiency.', price: 'From ₹499' },
      { title: 'Appliance Repair', desc: 'Expert fixing for AC, Fridge, Washing Machine, and more.', price: 'From ₹299' },
      { title: 'Lighting Installation', desc: 'Modern LED and decorative lighting for your beautiful home.', price: 'From ₹199' },
    ]
  },
  { 
    category: 'Plumbing',
    icon: <Droplets className="text-blue-500" />,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
    items: [
      { title: 'Leak Repair', desc: 'Fixing dripping taps and leaky pipes to save water.', price: 'From ₹149' },
      { title: 'Bathroom Fitting', desc: 'Professional installation of taps, showers, and toilets.', price: 'From ₹799' },
      { title: 'Water Tank Cleaning', desc: 'Ensuring your family gets clean and hygienic water.', price: 'From ₹599' },
    ]
  },
  { 
    category: 'General Maintenance',
    icon: <Wrench className="text-orange-500" />,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=800',
    items: [
      { title: 'Carpentry', desc: 'Furniture repair and custom woodwork for your home.', price: 'From ₹399' },
      { title: 'Painting', desc: 'Interior and exterior wall painting with premium finish.', price: 'From ₹999' },
      { title: 'Locksmith', desc: 'Emergency lock opening and secure installation services.', price: 'From ₹249' },
    ]
  }
];

export const Services: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % serviceCarousel.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pt-16 pb-20 overflow-hidden">
      {/* Services Hero Carousel */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden mb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0"
          >
            <div className="absolute inset-0 bg-black/60 z-10" />
            <img 
              src={serviceCarousel[currentSlide].url} 
              alt="Service Hero" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>

        <div className="max-w-7xl mx-auto text-center z-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-7xl font-black mb-4 text-white tracking-tighter">
              {serviceCarousel[currentSlide].title}
            </h1>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto font-medium">
              {serviceCarousel[currentSlide].subtitle}. Available 24/7 in Kannur.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <div className="space-y-32">
          {allServices.map((section, sIdx) => (
            <div key={sIdx} className="relative">
              <div className="flex flex-col md:flex-row items-center gap-12 mb-12">
                <div className={`w-full md:w-1/2 ${sIdx % 2 === 1 ? 'md:order-2' : ''}`}>
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <img 
                      src={section.image} 
                      alt={section.category} 
                      className="relative w-full aspect-video object-cover rounded-[2rem] shadow-2xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20">
                      {React.cloneElement(section.icon as React.ReactElement, { size: 32 })}
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter">{section.category}</h2>
                  </div>
                  <p className="text-xl text-zinc-500 mb-8 leading-relaxed">
                    Professional {section.category.toLowerCase()} services tailored for your specific needs. 
                    Our experts ensure safety and quality in every job.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-sm font-bold">
                      <Shield size={16} className="text-blue-600" /> Verified Experts
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-sm font-bold">
                      <Clock size={16} className="text-blue-600" /> 24/7 Support
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {section.items.map((item, iIdx) => (
                  <motion.div
                    key={iIdx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: iIdx * 0.1 }}
                  >
                    <Card className="h-full flex flex-col p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-none bg-zinc-50 dark:bg-zinc-900/50">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                        <p className="text-zinc-500 mb-6 leading-relaxed">{item.desc}</p>
                        <div className="flex items-center justify-between mb-8">
                          <span className="text-blue-600 font-black text-2xl">{item.price}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={12} className="fill-yellow-500 text-yellow-500" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <Link to="/register">
                        <Button className="w-full py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/10">
                          Book Now
                        </Button>
                      </Link>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Emergency CTA */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-40 p-12 md:p-20 bg-zinc-900 dark:bg-white rounded-[3rem] text-white dark:text-zinc-950 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">Need Emergency Help?</h2>
            <p className="text-xl text-zinc-400 dark:text-zinc-500 mb-12 max-w-2xl mx-auto font-medium">
              Our emergency team is ready to help you 24/7. Average response time is less than 30 minutes in Kannur.
            </p>
            <Link to="/emergency">
              <Button variant="danger" size="lg" className="px-16 py-8 text-xl rounded-full animate-glow shadow-2xl shadow-red-500/40">
                Call Emergency Team Now
              </Button>
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
};
