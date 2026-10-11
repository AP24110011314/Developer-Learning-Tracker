import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-page)] p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 max-w-sm"
      >
        {/* Giant 404 */}
        <div className="relative">
          <div className="text-[8rem] font-extrabold leading-none gradient-text select-none">
            404
          </div>
          <div className="absolute inset-0 text-[8rem] font-extrabold leading-none text-primary-500/10 blur-2xl select-none">
            404
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Page not found</h1>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            Looks like this page went for a walk and never came back.
            Let's get you back on track.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => window.history.back()}>
            <ArrowLeft size={16} /> Go back
          </Button>
          <Button as={Link} to="/">
            <Home size={16} /> Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
