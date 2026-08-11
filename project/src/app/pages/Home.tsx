import { Link } from 'react-router';
import { Zap, Code2, Trophy, Brain, Users, ArrowRight, Star, GitBranch, Terminal, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const features = [
    { icon: Code2, title: 'Live Code Editor', desc: 'Monaco-powered editor with 7 languages, real-time execution via Judge0', color: 'from-indigo-500 to-blue-500' },
    { icon: Brain, title: 'AI Resume Builder', desc: 'Claude AI generates ATS-optimized resumes from your coding activity', color: 'from-violet-500 to-purple-500' },
    { icon: Trophy, title: 'LeetCode-Style Problems', desc: 'Hundreds of problems with hidden test cases, scoring and leaderboards', color: 'from-amber-500 to-orange-500' },
    { icon: Users, title: 'Teacher–Student LMS', desc: 'Create classrooms, assign problems, track student performance live', color: 'from-emerald-500 to-teal-500' },
    { icon: GitBranch, title: 'Learning Roadmap', desc: 'AI analyses your weak spots and builds a personalised study plan', color: 'from-pink-500 to-rose-500' },
    { icon: Terminal, title: 'Code Playground', desc: 'Free-form sandbox for experimenting in any supported language', color: 'from-cyan-500 to-sky-500' },
  ];

  const stats = [
    { value: '4+', label: 'Tracks' },
    { value: '400+', label: 'Problems' },
    { value: 'AI', label: 'Tutor' },
    { value: '∞', label: 'Learning' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#030612] text-white overflow-x-hidden relative">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />
      
      {/* High-end Glowing Orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-indigo-500/20 to-purple-500/0 rounded-full blur-[130px] pointer-events-none" 
      />
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Glassmorphic Navbar */}
      <nav className="relative z-20 border-b border-white/5 backdrop-blur-xl bg-[#030612]/75 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 cursor-pointer"
            >
              <Zap className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">CodeLearn</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors font-semibold">
              Sign in
            </Link>
            <Link to="/login" className="px-4 py-2.5 text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 hover:scale-[1.02]">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-28 pb-20 px-6 text-center max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-8 shadow-inner shadow-indigo-500/10"
        >
          <Cpu className="w-3.5 h-3.5 animate-pulse" /> Next-Gen AI Code Classroom
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.05]"
        >
          Master Coding. Learn Faster.<br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Excel In Placements.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Practice 10-level structured language tracks, collaborate in live classrooms, solve daily challenges, and build ATS-optimized resumes using AI.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-2xl font-bold text-base transition-all shadow-2xl shadow-indigo-500/30 hover:scale-[1.03] group">
            Start Learning Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-base transition-all hover:border-white/20">
            Explore Problems
          </Link>
        </motion.div>

        {/* Animated Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto mt-20 p-6 bg-white/[0.01] border border-white/5 rounded-3xl backdrop-blur-sm"
        >
          {stats.map((s, idx) => (
            <motion.div key={idx} variants={itemVariants} className="text-center py-2 relative">
              {idx < 3 && <div className="absolute right-0 top-1/4 bottom-1/4 w-[1px] bg-white/5 hidden md:block" />}
              <div className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1 font-bold uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Ultimate Coding Toolkit</h2>
          <p className="text-gray-400 max-w-lg mx-auto">Everything you need to master syntax, patterns, and placement rounds.</p>
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              whileHover={{ y: -6, borderColor: 'rgba(99, 102, 241, 0.3)' }}
              className="group relative p-8 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-3xl transition-all duration-300 cursor-default overflow-hidden"
            >
              {/* Corner accent glow */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300`} />
              
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 shadow-lg shadow-black/40`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-extrabold text-lg text-white mb-3 tracking-tight">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Glassmorphic Call-to-Action Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16 text-center">
        <motion.div 
          whileInView={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.95 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-indigo-950/20 to-purple-950/20 border border-indigo-500/10 rounded-3xl p-12 md:p-16 backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-indigo-500/[0.01] pointer-events-none" />
          <h2 className="text-3xl md:text-4xl font-black mb-4">Start Your Roadmap Today</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">Create a free account, choose Python/JS/C++/Java, and unlock instant compiler outputs.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 hover:scale-[1.03] group">
            Sign Up Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-10 text-center text-xs text-gray-500">
        <div className="mb-2 font-semibold">CodeLearn Platform</div>
        <div>© 2026 CodeLearn · High-Performance Engineering Platform</div>
      </footer>
    </div>
  );
}
