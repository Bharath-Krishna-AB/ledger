import Link from 'next/link'
import { ArrowLeft, Wallet, ShieldCheck } from 'lucide-react'
import { login, signInWithGoogle } from './actions'

export default async function LoginPage(props: { searchParams?: Promise<{ message?: string }> }) {
    const searchParams = await props.searchParams;
    const message = searchParams?.message;

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Brutalist geometric backgrounds */}
            <div className="absolute top-10 right-10 w-48 h-48 bg-primary border-4 border-black shadow-brutal rounded-none transform rotate-12 -z-10"></div>
            <div className="absolute bottom-10 left-10 w-64 h-64 bg-secondary border-4 border-black shadow-brutal rounded-full -z-10"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
                <div className="flex justify-center items-center gap-2 mb-8">
                    <div className="w-16 h-16 bg-accent border-4 border-black flex items-center justify-center shadow-brutal">
                        <Wallet className="w-8 h-8 text-black" />
                    </div>
                </div>

                <h2 className="mt-6 text-center text-4xl font-kol font-bold tracking-tighter uppercase text-black">
                    Welcome Back
                </h2>
                <p className="mt-2 text-center text-sm text-gray-800 font-space font-bold tracking-tight uppercase">
                    Sign in to access your financial dashboard and ledger.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
                <div className="bg-white py-10 px-6 shadow-brutal-lg border-4 border-black sm:px-10">

                    {/* Google OAuth Form */}
                    <form action={signInWithGoogle} className="mb-6">
                        <button
                            type="submit"
                            className="flex w-full justify-center items-center gap-3 rounded-none bg-white border-2 border-black px-4 py-3.5 text-sm font-space font-bold uppercase text-black hover:bg-gray-100 hover:-translate-y-1 shadow-brutal transition-all active:translate-y-0 active:shadow-none"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                                <path d="M1 1h22v22H1z" fill="none" />
                            </svg>
                            Continue with Google
                        </button>
                    </form>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-black"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-white px-4 border-2 border-black text-black font-space font-bold uppercase tracking-tight shadow-brutal">Or continue with email</span>
                        </div>
                    </div>

                    {message && (
                        <div className="mb-6 bg-primary border-2 border-black p-4 shadow-brutal">
                            <p className="text-sm font-bold font-space uppercase text-white text-center">{message}</p>
                        </div>
                    )}

                    <form className="space-y-6" action={login}>
                        <div>
                            <label htmlFor="email" className="block text-xs font-space font-bold uppercase text-black tracking-tight">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full appearance-none rounded-none bg-white border-2 border-black px-4 py-3 placeholder-gray-500 text-black font-space font-bold focus:shadow-brutal focus:-translate-y-1 focus:outline-none sm:text-sm tracking-tight transition-all uppercase"
                                    placeholder="NAME@EXAMPLE.COM"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-space font-bold uppercase text-black tracking-tight">
                                Password
                            </label>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="block w-full appearance-none rounded-none bg-white border-2 border-black px-4 py-3 placeholder-gray-500 text-black font-space font-bold focus:shadow-brutal focus:-translate-y-1 focus:outline-none sm:text-sm tracking-tight transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded-none border-2 border-black bg-white text-accent focus:ring-accent focus:ring-offset-white accent-accent cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-xs font-space font-bold uppercase text-black tracking-tight cursor-pointer">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-xs">
                                <a href="#" className="font-space font-bold uppercase text-black hover:text-accent transition-colors tracking-tight underline">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center items-center gap-2 rounded-none bg-accent border-2 border-black px-4 py-3.5 text-sm font-space font-bold uppercase text-black shadow-brutal hover:bg-primary hover:text-white focus:outline-none transition-all hover:-translate-y-1 active:translate-y-0 active:shadow-none"
                            >
                                Sign In <ShieldCheck className="w-5 h-5 border-2 border-black rounded-sm shadow-brutal bg-white text-black p-0.5" />
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center border-t-2 border-black pt-6">
                        <p className="text-xs font-space font-bold uppercase text-gray-600 tracking-tight">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="font-bold text-black border-b-2 border-black hover:text-accent hover:border-accent transition-colors">
                                Create one now
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs font-space font-bold uppercase text-black hover:text-accent transition-colors underline">
                        <ArrowLeft className="w-4 h-4 border-2 border-black rounded-none shadow-brutal p-0.5" /> Back to home
                    </Link>
                </div>
            </div>
        </div>
    )
}
