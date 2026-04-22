// src/components/ReviewsSection.jsx
import { motion } from "framer-motion";
import { SAMPLE_REVIEWS } from "../data/books";

export default function ReviewsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <section id="reviews" className="py-16 md:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Our Readers Say</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Join thousands of satisfied customers who've discovered their next favorite book at DustyShelf
          </p>
        </motion.div>

        {/* Reviews Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {SAMPLE_REVIEWS.map((review) => (
            <motion.div
              key={review.id}
              variants={itemVariants}
              className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-500/20 rounded-xl p-6 hover:border-indigo-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-300 mb-4 leading-relaxed">"{review.text}"</p>

              {/* Reviewer Info */}
              <div className="border-t border-indigo-500/20 pt-4">
                <p className="font-semibold text-white text-sm mb-1">{review.name}</p>
                <p className="text-xs text-indigo-400 mb-2">{review.role}</p>
                <p className="text-xs text-gray-500">Purchased: {review.book}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center mt-12"
        >
          <a
            href="#shop"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20"
          >
            Explore Our Collection
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
