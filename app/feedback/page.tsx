'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  MessageSquareHeart,
  Send,
  Star,
  CheckCircle2,
  ArrowLeft,
  Sparkles
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const ratingLabels = ['Terrible', 'Poor', 'Average', 'Good', 'Excellent']
const feedbackCategories = [
  { id: 'general', label: 'General', emoji: '💬' },
  { id: 'bug', label: 'Bug Report', emoji: '🐛' },
  { id: 'feature', label: 'Feature Request', emoji: '✨' },
  { id: 'content', label: 'Content Quality', emoji: '📚' },
  { id: 'ui', label: 'Design / UI', emoji: '🎨' },
]

export default function FeedbackPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('general')
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Please enter your name.')
      return
    }

    if (!email.trim()) {
      toast.error('Please enter your email.')
      return
    }

    if (!message.trim()) {
      toast.error('Please enter your feedback message.')
      return
    }

    if (rating === 0) {
      toast.error('Please select a rating.')
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase.from('feedback').insert({
        name: name.trim(),
        email: email.trim(),
        category,
        rating,
        message: message.trim(),
      })

      if (error) throw error

      setIsSubmitted(true)
      toast.success('Thank you for your feedback!')
    } catch (err) {
      console.error('Feedback submission error:', err)
      toast.error('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setName('')
    setEmail('')
    setCategory('general')
    setRating(0)
    setMessage('')
    setIsSubmitted(false)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-[0.04] dark:opacity-[0.08] pointer-events-none blur-[100px]" />

        <div className="relative w-full max-w-lg text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mx-auto w-24 h-24 rounded-[2rem] bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center shadow-2xl shadow-green-500/10">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              Thank You! <span className="inline-block animate-bounce">🎉</span>
            </h1>
            <p className="text-muted-foreground font-medium text-lg max-w-md mx-auto leading-relaxed">
              Your feedback has been submitted successfully. We truly appreciate your input and will use it to improve the platform.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              onClick={handleReset}
              variant="outline"
              className="rounded-2xl px-8 h-12 border-border/60 hover:border-primary/50 dark:border-white/10 dark:hover:border-primary/50 bg-white/50 dark:bg-white/5 backdrop-blur-md text-foreground dark:text-white font-bold text-xs transition-all hover:-translate-y-1 active:scale-95 uppercase tracking-widest"
            >
              Submit Another
            </Button>
            <Link href="/">
              <Button className="rounded-2xl px-8 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-2xl shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95 uppercase tracking-widest">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-12 md:py-20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-[0.04] dark:opacity-[0.08] pointer-events-none blur-[100px]" />
      <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--foreground) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container mx-auto max-w-2xl relative z-10">
        {/* Back Navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors mb-10 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12 space-y-5">
          <div className="mx-auto w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-xl shadow-primary/10 mb-6">
            <MessageSquareHeart className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.25em] border border-primary/20">
              <Sparkles className="h-3 w-3" />
              We Value Your Opinion
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Share Your <span className="text-primary">Feedback</span>
            </h1>
            <p className="text-muted-foreground font-medium text-base max-w-lg mx-auto leading-relaxed">
              Help us improve Clinical Repository. Your thoughts, suggestions, and bug reports make a real difference.
            </p>
          </div>
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Card Container */}
          <div className="rounded-[1.8rem] border border-border/50 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl p-6 md:p-8 shadow-2xl shadow-black/[0.03] dark:shadow-black/20 space-y-7">
            {/* Name & Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <Label htmlFor="feedback-name" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="feedback-name"
                  placeholder="Your name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl h-12 bg-white/50 dark:bg-white/5 border-border/40 dark:border-white/10 focus:border-primary/50 transition-colors placeholder:text-muted-foreground/30"
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="feedback-email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="feedback-email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl h-12 bg-white/50 dark:bg-white/5 border-border/40 dark:border-white/10 focus:border-primary/50 transition-colors placeholder:text-muted-foreground/30"
                />
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                Category
              </Label>
              <div className="flex flex-wrap gap-2.5">
                {feedbackCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`
                      px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border
                      ${category === cat.id
                        ? 'bg-primary/10 border-primary/30 text-primary shadow-md shadow-primary/10 -translate-y-0.5'
                        : 'bg-white/50 dark:bg-white/5 border-border/40 dark:border-white/10 text-muted-foreground hover:border-primary/20 hover:text-foreground hover:-translate-y-0.5'
                      }
                    `}
                  >
                    <span className="mr-1.5">{cat.emoji}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                Rating <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 transition-transform duration-200 hover:scale-125 active:scale-95"
                    >
                      <Star
                        className={`h-7 w-7 transition-all duration-200 ${
                          star <= (hoveredRating || rating)
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]'
                            : 'text-muted-foreground/20'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {(hoveredRating || rating) > 0 && (
                  <span className="text-xs font-bold text-muted-foreground/60 animate-in fade-in duration-200">
                    {ratingLabels[(hoveredRating || rating) - 1]}
                  </span>
                )}
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2.5">
              <Label htmlFor="feedback-message" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                Your Feedback <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="feedback-message"
                placeholder="Tell us what you think... What do you love? What can we improve?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="rounded-xl bg-white/50 dark:bg-white/5 border-border/40 dark:border-white/10 focus:border-primary/50 transition-colors placeholder:text-muted-foreground/30 resize-none text-sm leading-relaxed"
              />
              <p className="text-[10px] text-muted-foreground/40 font-medium">
                {message.length}/1000 characters
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || !email.trim() || !message.trim() || rating === 0}
              className="rounded-2xl px-12 h-14 bg-primary hover:bg-primary/90 text-primary-foreground border border-transparent dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-primary/10 dark:backdrop-blur-md font-bold text-xs shadow-2xl shadow-primary/20 dark:shadow-none transition-all hover:-translate-y-1.5 active:scale-95 uppercase tracking-widest disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none gap-2.5"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
