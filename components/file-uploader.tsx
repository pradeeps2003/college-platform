'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, File as FileIcon, ShieldCheck, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface FileUploaderProps {
    onFileSelect: (file: File | null) => void
    accept?: string
    maxSizeMB?: number
}

export function FileUploader({ onFileSelect, accept, maxSizeMB = 50 }: FileUploaderProps) {
    const [dragActive, setDragActive] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [error, setError] = useState<string | null>(null)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const validateFile = (file: File) => {
        if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
            setError(`Error: File size exceeds ${maxSizeMB}MB limit.`)
            return false
        }
        setError(null)
        return true
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            if (validateFile(file)) {
                setSelectedFile(file)
                onFileSelect(file)
            }
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (validateFile(file)) {
                setSelectedFile(file)
                onFileSelect(file)
            }
        }
    }

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedFile(null)
        onFileSelect(null)
        if (inputRef.current) {
            inputRef.current.value = ''
        }
    }

    return (
        <div className="w-full">
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={accept}
                onChange={handleChange}
            />

            <AnimatePresence mode="wait">
                {!selectedFile ? (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                            "group relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[2rem] transition-all duration-500 cursor-pointer overflow-hidden",
                            dragActive
                                ? "border-primary bg-primary/5 scale-[1.02] shadow-2xl shadow-primary/10"
                                : "border-border hover:border-primary/50 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900",
                            error ? "border-red-500/50 bg-red-50/10" : ""
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                    >
                        {/* Background Pulsing Pulse */}
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="bg-white dark:bg-slate-800 p-5 rounded-full mb-4 shadow-xl border border-border group-hover:scale-110 transition-all duration-500">
                                <Upload className="h-8 w-8 text-primary group-hover:animate-pulse" />
                            </div>
                            <div className="space-y-1 text-center font-bold">
                                <p className="text-base tracking-tight">
                                    Click to upload material
                                </p>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">
                                    or drag and drop file here
                                </p>
                            </div>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-4 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="selected"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group flex items-center justify-between p-5 border border-primary/20 rounded-[2rem] bg-white dark:bg-slate-900 shadow-xl shadow-primary/5 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />

                        <div className="flex items-center gap-5 relative z-10 w-full">
                            <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20 transition-transform duration-500">
                                <FileIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-base tracking-tight truncate">{selectedFile.name}</p>
                                <div className="flex items-center gap-4 mt-0.5">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={removeFile}
                                className="h-9 w-9 rounded-full hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-all active:scale-90"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
