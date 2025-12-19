"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/Button";
import { supabase } from "@/lib/supabase";

export function Hero() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        async function getUser() {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        }
        getUser();
    }, []);

    return (
        <section className="flex flex-col items-center text-center mb-12 pt-12 md:mb-24 md:pt-24 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-4xl mx-auto px-4">
            <h1 className="text-white text-3xl md:text-6xl font-bold mb-6 tracking-tight drop-shadow-sm leading-tight">
                Ranking Challenge
            </h1>

            <div className="flex flex-col gap-2 mb-8 md:mb-10 min-h-[80px]">
                <TypingText
                    text="Organisez, rejoignez et suivez vos challenges"
                    delay={0}
                    className="text-white/60 text-base md:text-xl font-light"
                />
                <TypingText
                    text="Mesurez vos performances et comparez-vous facilement à vos amis"
                    delay={2500}
                    className="text-white/40 text-sm md:text-base font-light"
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href="/challenges/new" className="w-full sm:w-auto">
                    <Button variant="gold" size="lg" className="w-full sm:w-auto rounded-xl px-10 h-12 md:h-14 text-base md:text-lg shadow-[0_0_20px_rgba(255,249,61,0.2)] hover:shadow-[0_0_25px_rgba(255,249,61,0.4)] transition-all">
                        Créer un challenge
                    </Button>
                </Link>

                {!user && (
                    <Link href="/auth/login" className="w-full sm:w-auto">
                        <Button variant="green" size="lg" className="w-full sm:w-auto rounded-xl px-10 h-12 md:h-14 text-base md:text-lg shadow-[0_0_20px_rgba(35,122,87,0.3)] hover:shadow-[0_0_25px_rgba(35,122,87,0.5)] transition-all">
                            Connexion
                        </Button>
                    </Link>
                )}
            </div>
        </section>
    );
}

function TypingText({ text, delay, className }: { text: string, delay: number, className: string }) {
    const [displayedText, setDisplayedText] = useState("");
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const startTimeout = setTimeout(() => {
            setStarted(true);
        }, delay);
        return () => clearTimeout(startTimeout);
    }, [delay]);

    useEffect(() => {
        if (!started) return;

        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex <= text.length) {
                setDisplayedText(text.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 50); // Speed of typing (slower)

        return () => clearInterval(interval);
    }, [started, text]);

    return (
        <p className={className} aria-label={text}>
            {displayedText}
            {started && displayedText.length < text.length && (
                <span className="animate-pulse">|</span>
            )}
        </p>
    );
}
