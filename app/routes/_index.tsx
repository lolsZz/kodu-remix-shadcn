/**
 * This is a remix project using shadcn and tailwindcss, framer motion, it's currently got everything configured and ready to go.
 */
import type { MetaFunction } from '@remix-run/node';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const meta: MetaFunction = () => {
  return [
    { title: 'Japanese OnlyFans Clone' },
    {
      name: 'description',
      content: 'A Japanese OnlyFans clone for content creators and subscribers',
    },
  ];
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export default function Index() {
  const { t } = useTranslation();

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-pink-100 to-white dark:from-gray-900 dark:to-gray-800"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container mx-auto px-4 py-16">
        <motion.header className="text-center mb-16" variants={itemVariants}>
          <motion.h1
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {t('welcome')}
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            日本の クリエイターと購読者のためのプラットフォーム
          </motion.p>
        </motion.header>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
        >
          {[t('creators'), t('subscribers')].map((title, index) => (
            <motion.div key={title} variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {index === 0
                      ? 'コンテンツを共有し、ファンと繋がりましょう'
                      : '好きなクリエイターをサポートし、独占コンテンツを楽しみましょう'}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div className="mt-16 text-center" variants={itemVariants}>
          <motion.h2
            className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            今すぐ始めましょう！
          </motion.h2>
          <motion.div className="space-x-4" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="lg">{t('login')}</Button>
            <Button size="lg" variant="outline">{t('signup')}</Button>
          </motion.div>
        </motion.div>

        <motion.footer
          className="mt-16 text-center text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <p>
            安全で楽しいプラットフォームを目指しています。ご利用は18歳以上に限ります。
          </p>
        </motion.footer>
      </div>
    </motion.div>
  );
}
