
import React, { useRef } from 'react';
import SpotlightCard from '../../ui/SpotlightCard';
import NeonGradientCard from '../../ui/NeonGradientCard';
import MovingBorderButton from '../../ui/MovingBorderButton';
import { Link } from 'react-router-dom';

const ARSENAL_ITEMS = [
    { title: 'React.js', percentage: 95, icon: 'fab fa-react', color: 'text-cyan-400' },
    { title: 'TypeScript', percentage: 88, icon: 'fab fa-js', color: 'text-blue-400' },
    { title: 'Node.js', percentage: 90, icon: 'fab fa-node', color: 'text-green-500' },
    { title: 'AWS', percentage: 92, icon: 'fab fa-aws', color: 'text-orange-400' },
    { title: 'Docker', percentage: 85, icon: 'fab fa-docker', color: 'text-blue-500' },
    { title: 'Python', percentage: 82, icon: 'fab fa-python', color: 'text-yellow-400' },
    { title: 'TensorFlow', percentage: 78, icon: 'fas fa-brain', color: 'text-orange-500' },
    { title: 'Blockchain', percentage: 75, icon: 'fas fa-link', color: 'text-purple-400' },
];

const TECH_CARDS = [
    {
        title: "Neural Network",
        desc: "Advanced AI system with deep learning capabilities for predictive analytics and pattern recognition.",
        tags: ["TensorFlow", "Python", "CUDA"],
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=400&auto=format&fit=crop"
    },
    {
        title: "Quantum Cloud",
        desc: "Next-generation cloud infrastructure leveraging quantum computing for unprecedented processing power.",
        tags: ["AWS", "Kubernetes", "Docker"],
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop"
    },
    {
        title: "Cyber Defense",
        desc: "Military-grade cybersecurity framework with real-time threat detection and automated response.",
        tags: ["Zero Trust", "AI Defense", "Encryption"],
        image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=400&auto=format&fit=crop"
    }
];

const HomeTechArsenal: React.FC = () => {
  return (
    <section className="py-20 bg-[#020617] text-white relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-bold tracking-widest uppercase mb-4">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              Prism Flux Architecture
           </div>
           <h2 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 font-sans">
              TECHNICAL ARSENAL
           </h2>
           <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Mastery of cutting-edge technologies and frameworks. Refracting complex challenges into elegant solutions.
           </p>
        </div>

        {/* Tech Chips Grid (Arsenal) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {ARSENAL_ITEMS.map((item, idx) => (
                <SpotlightCard 
                    key={idx} 
                    className="!p-4 flex flex-col items-center justify-center gap-3 group hover:bg-gray-800/80 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] cursor-default"
                >
                    <div className={`text-4xl ${item.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                        <i className={item.icon}></i>
                    </div>
                    <div className="text-center">
                        <h4 className="font-bold text-gray-200">{item.title}</h4>
                        <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden w-24 mx-auto">
                            <div className={`h-full bg-gradient-to-r from-purple-500 to-cyan-500`} style={{ width: `${item.percentage}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1 block">{item.percentage}%</span>
                    </div>
                </SpotlightCard>
            ))}
        </div>

        {/* Feature Cards (Neon) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {TECH_CARDS.map((card, idx) => (
                <NeonGradientCard key={idx} className="h-full transition-transform duration-300 hover:-translate-y-2">
                    <div className="relative h-48 mb-6 overflow-hidden rounded-lg">
                        <img src={card.image} alt={card.title} className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{card.title}</h3>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                        {card.desc}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {card.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-purple-300 font-mono">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <MovingBorderButton className="w-full">
                        EXPLORE
                    </MovingBorderButton>
                </NeonGradientCard>
            ))}
        </div>

        {/* Metrics Section (Glassmorphism) */}
        <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 md:p-12 transition-transform duration-300 hover:scale-[1.01]">
             <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none"></div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
                <div className="text-center group">
                    <div className="text-5xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 transition-colors">150+</div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">Projects Completed</div>
                </div>
                <div className="text-center group">
                    <div className="text-5xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 transition-colors">99%</div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">Client Satisfaction</div>
                </div>
                <div className="text-center group">
                    <div className="text-5xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 transition-colors">25+</div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">Industry Awards</div>
                </div>
                <div className="text-center group">
                    <div className="text-5xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 transition-colors">500+</div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">Code Commits Daily</div>
                </div>
             </div>
        </div>

        {/* Footer Call to Action */}
        <div className="text-center mt-20">
             <h3 className="text-3xl font-bold mb-6">Refracting Ideas Into Reality</h3>
             <div className="flex justify-center gap-4">
                <Link to="/contact">
                    <MovingBorderButton>
                        INITIALIZE CONNECTION
                    </MovingBorderButton>
                </Link>
             </div>
        </div>

      </div>
    </section>
  );
};

export default HomeTechArsenal;
