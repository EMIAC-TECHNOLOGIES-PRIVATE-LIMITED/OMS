// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			brand: {
  				DEFAULT: '#007b3c',
  				light: '#28a745',
  				dark: '#005a2d'
  			},
  			neutral: {
  				'50': '#F9FAFB',
  				'100': '#F3F4F6',
  				'200': '#E5E7EB',
  				'300': '#D1D5DB',
  				'400': '#9CA3AF',
  				'500': '#6B7280',
  				'600': '#4B5563',
  				'700': '#374151',
  				'800': '#1F2937',
  				'900': '#111827'
  			},
  			red: {
  				'500': '#EF4444',
  				'600': '#DC2626',
  				'700': '#B91C1C'
  			},
  			blue: {
  				'500': '#3B82F6',
  				'600': '#2563EB',
  				'700': '#1D4ED8'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		boxShadow: {
  			premium: '0 4px 6px rgba(0, 123, 60, 0.1)',
  			'premium-lg': '0 10px 15px rgba(0, 123, 60, 0.1)',
  			modal: '0 10px 25px rgba(0, 0, 0, 0.1)'
  		},
  		fontFamily: {
  			sans: [
  				'Sarabun',
  				'sans-serif'
  			]
  		},
  		backgroundImage: {
  			watermark: "url('/images/watermark.png')"
  		},
  		keyframes: {
  			pulse: {
  				'0%, 100%': {
  					opacity: 1
  				},
  				'50%': {
  					opacity: 0.5
  				}
  			},
  			fadeIn: {
  				'0%': {
  					opacity: 0
  				},
  				'100%': {
  					opacity: 1
  				}
  			},
  			scaleIn: {
  				'0%': {
  					transform: 'scale(0.95)'
  				},
  				'100%': {
  					transform: 'scale(1)'
  				}
  			},
  			fadeOut: {
  				'0%': {
  					opacity: 1
  				},
  				'100%': {
  					opacity: 0
  				}
  			},
  			scaleOut: {
  				'0%': {
  					transform: 'scale(1)'
  				},
  				'100%': {
  					transform: 'scale(0.95)'
  				}
  			}
  		},
  		animation: {
  			pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			fadeIn: 'fadeIn 0.3s ease-out forwards',
  			scaleIn: 'scaleIn 0.3s ease-out forwards',
  			fadeOut: 'fadeOut 0.3s ease-in forwards',
  			scaleOut: 'scaleOut 0.3s ease-in forwards'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate"),
	require('tailwind-scrollbar')({ nocompatible: true }),
  ],
};
