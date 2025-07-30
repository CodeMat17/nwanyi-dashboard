'use client'

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800 p-6'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className='max-w-3xl text-center space-y-8'>
        <h1 className='text-5xl md:text-6xl font-bold text-gray-900 dark:text-white'>
          Welcome to <span className='text-amber-600'>Nwanyị bụ ife</span>{" "}
          Festival
        </h1>
        <p className='text-xl text-gray-600 dark:text-gray-300'>
          Celebrating the strength, beauty, and creativity of women in our
          community.
        </p>
        <div className='flex justify-center'>
       
          <Link href='/admin/carousel'>
            <Button variant='outline' size='lg'>
              Admin Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
