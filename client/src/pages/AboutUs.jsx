import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaHandshake, FaChartLine, FaAward } from 'react-icons/fa';

const AboutUs = () => {
  const scrollRef = useRef(null);

  const scrollToItem = (index) => {
    if (scrollRef.current) {
      const items = scrollRef.current.children;
      if (items[index]) {
        items[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  useEffect(() => {
    // Initialize scroll functionality
    if (scrollRef.current) {
      const items = scrollRef.current.children;
      Array.from(items).forEach((item, index) => {
        item.addEventListener('click', () => scrollToItem(index));
      });
    }
  }, []);

  const stats = [
    { icon: <FaUsers className="text-4xl text-blue-600" />, value: "10K+", label: "Happy Customers" },
    { icon: <FaHandshake className="text-4xl text-green-600" />, value: "5K+", label: "Services Completed" },
    { icon: <FaChartLine className="text-4xl text-purple-600" />, value: "98%", label: "Customer Satisfaction" },
    { icon: <FaAward className="text-4xl text-yellow-600" />, value: "15+", label: "Years Experience" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About Our Company</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              We are dedicated to providing exceptional home services with a focus on quality, reliability, and customer satisfaction.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg p-6 shadow-lg text-center"
            >
              {stat.icon}
              <h3 className="text-3xl font-bold mt-4">{stat.value}</h3>
              <p className="text-gray-600 mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Mission Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg p-8 shadow-lg"
          >
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              Our mission is to provide exceptional home services that make a positive impact on our customers' lives. We strive to be the most trusted and reliable service provider in the industry.
            </p>
          </motion.div>

          {/* Vision Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg p-8 shadow-lg"
          >
            <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              We envision a future where every home receives the highest quality service, delivered with professionalism and care. We aim to be the industry leader in innovation and customer satisfaction.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "John Smith",
                position: "CEO & Founder",
                image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
              },
              {
                name: "Sarah Johnson",
                position: "Operations Director",
                image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
              },
              {
                name: "Michael Chen",
                position: "Technical Director",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
              }
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg overflow-hidden shadow-lg"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-gray-600">{member.position}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: "Quality",
              description: "We never compromise on the quality of our services."
            },
            {
              title: "Integrity",
              description: "We conduct our business with honesty and transparency."
            },
            {
              title: "Innovation",
              description: "We continuously improve and innovate our services."
            },
            {
              title: "Customer Focus",
              description: "Our customers are at the heart of everything we do."
            }
          ].map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg p-6 shadow-lg text-center"
            >
              <h3 className="text-xl font-bold mb-4">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutUs; 