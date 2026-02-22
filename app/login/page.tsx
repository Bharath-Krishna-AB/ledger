import Link from 'next/link'
import { ArrowLeft, Wallet, ShieldCheck, Mail, Lock } from 'lucide-react'
import { login, signInWithGoogle } from './actions'

export default async function LoginPage(props: { searchParams?: Promise<{ message?: string }> }) {
    const searchParams = await props.searchParams;
    const message = searchParams?.message;

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Soft Ambient Background Orbs */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] -z-10"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
                <div className="flex justify-center items-center mb-8">
                    <Link href="/" className="flex items-center gap-3 group transition-all duration-300 transform hover:scale-105">
                        <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center shadow-lg group-hover:shadow-primary/20 transition-all">
                            <span className="text-white font-kol text-2xl tracking-tighter">K</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-black">Kolpay</span>
                    </Link>
                </div>

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-black">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 font-medium">
                        Access your financial command center.
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl border border-white shadow-soft-lg rounded-[40px] p-8 sm:p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-[0.03]">
                        <Wallet className="w-32 h-32 text-black rotate-12" />
                    </div>

                    {/* Google OAuth */}
                    <form action={signInWithGoogle}>
                        <button
                            type="submit"
                            className="group flex w-full justify-center items-center gap-3 rounded-2xl bg-white border border-gray-100 px-4 py-4 text-sm font-semibold text-gray-700 shadow-soft hover:shadow-soft-lg hover:bg-gray-50 transition-all duration-300 active:scale-[0.98]"
                        >
                            <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span className="tracking-tight">Continue with Google</span>
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-white px-4 text-gray-400 font-bold uppercase tracking-widest text-[10px]">Or with email</span>
                        </div>
                    </div>

                    {message && (
                        <div className="mb-6 bg-red-50 border border-red-100 p-4 rounded-2xl animate-shake">
                            <p className="text-xs font-bold text-red-600 text-center">{message}</p>
                        </div>
                    )}

                    <form className="space-y-5" action={login}>
                        <div>
                            <label htmlFor="email" className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2 ml-1">
                                Email address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full rounded-2xl bg-gray-50/50 border border-gray-100 pl-12 pr-4 py-4 text-sm font-semibold text-black placeholder-gray-400 focus:bg-white focus:shadow-soft focus:ring-2 focus:ring-black/5 outline-none transition-all duration-300"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2 ml-1">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="block w-full rounded-2xl bg-gray-50/50 border border-gray-100 pl-12 pr-4 py-4 text-sm font-semibold text-black placeholder-gray-400 focus:bg-white focus:shadow-soft focus:ring-2 focus:ring-black/5 outline-none transition-all duration-300"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded-md border-gray-300 text-black focus:ring-black cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-xs font-semibold text-gray-500 cursor-pointer hover:text-black transition-colors">
                                    Remember me
                                </label>
                            </div>

                            <a href="#" className="text-xs font-bold text-black hover:text-primary transition-colors underline decoration-black/10 underline-offset-4">
                                Forgot password?
                            </a>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center items-center gap-2 rounded-2xl bg-black px-4 py-4 text-sm font-bold text-white shadow-soft hover:shadow-soft-lg hover:shadow-black/10 transition-all duration-300 active:scale-[0.98] overflow-hidden"
                            >
                                <span className="relative z-10 font-bold">Sign In</span>
                                <ShieldCheck className="w-5 h-5 relative z-10 transition-transform group-hover:rotate-12" />
                                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center bg-gray-50/50 -mx-10 -mb-10 p-6 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="text-black font-bold hover:text-primary transition-colors hover:underline underline-offset-4 decoration-black/10">
                                Create one now
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black transition-all hover:-translate-x-1">
                        <ArrowLeft className="w-4 h-4" /> Back to home
                    </Link>
                </div>
            </div>
        </div>
    )
}
