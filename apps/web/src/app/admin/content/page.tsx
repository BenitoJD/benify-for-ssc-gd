'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  List,
  FileCheck,
  ClipboardList,
  ArrowRight,
  FileText
} from 'lucide-react'
import { adminApi } from '@/lib/api/admin'

interface ContentStats {
  subjects: number
  topics: number
  lessons: number
  questions: number
  testSeries: number
  pendingReview: number
}

export default function AdminContentPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<ContentStats>({
    subjects: 0,
    topics: 0,
    lessons: 0,
    questions: 0,
    testSeries: 0,
    pendingReview: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [subjects, topics, lessons, testSeries] = await Promise.all([
          adminApi.listSubjects({ limit: 100 }),
          adminApi.listTopics({ limit: 100 }),
          adminApi.listLessons({ limit: 100 }),
          adminApi.listTestSeries({ limit: 100 }),
        ])

        setStats({
          subjects: subjects.meta.total,
          topics: topics.meta.total,
          lessons: lessons.meta.total,
          questions: 0,
          testSeries: testSeries.meta.total,
          pendingReview: 0,
        })
      } catch (error) {
        console.error('Failed to load content stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  const contentCards = [
    {
      title: 'Subjects',
      description: 'Manage subjects with name, code, description, and icon',
      href: '/admin/content/subjects',
      icon: BookOpen,
      count: stats.subjects,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Topics',
      description: 'Create and edit topics with subject association',
      href: '/admin/content/topics',
      icon: List,
      count: stats.topics,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Lessons',
      description: 'Rich text content, video URLs, order, premium flag',
      href: '/admin/content/lessons',
      icon: FileCheck,
      count: stats.lessons,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Test Series',
      description: 'Create tests with type, duration, question count',
      href: '/admin/content/test-series',
      icon: ClipboardList,
      count: stats.testSeries,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text-main)] mb-2">Content Management</h1>
        <p className="font-bold text-[var(--text-muted)] text-sm uppercase tracking-widest">Manage all platform content - subjects, topics, lessons, questions, and tests</p>
      </div>

      <div className="card-brilliant p-6 font-bold text-[var(--text-muted)] text-[15px] bg-gray-50/50">
        Live counts are shown for resources with real backend APIs. Question-bank admin endpoints are not currently exposed, so that section is hidden from the main admin workflow.
      </div>

      {/* Pending Review Alert */}
      {stats.pendingReview > 0 && (
        <div className="card-brilliant p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-2 border-yellow-200 bg-yellow-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-2xl border-2 border-yellow-200">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="font-bold text-yellow-800 text-[15px]">Items Pending Review</p>
              <p className="text-sm font-semibold text-yellow-600">{stats.pendingReview} items need review before publishing</p>
            </div>
          </div>
          <Link
            href="/admin/content?filter=review"
            className="px-6 py-3 bg-yellow-400 text-yellow-900 font-bold rounded-2xl shadow-[0_4px_0_theme(colors.yellow.500)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all whitespace-nowrap"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {contentCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.title}
              href={card.href}
              className="card-brilliant p-6 hover:-translate-y-1 transition-transform group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.bgColor} p-3 rounded-2xl`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[var(--text-main)] transition-colors" />
              </div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{card.title}</h3>
              <p className="font-display text-3xl font-extrabold tracking-tight text-[var(--text-main)] mt-1">{isLoading ? '...' : card.count.toLocaleString()}</p>
            </Link>
          )
        })}
      </div>

      {/* Content Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.title}
              href={card.href}
              className="card-brilliant p-0 overflow-hidden hover:-translate-y-1 transition-transform group"
            >
              <div className={`${card.color} p-8 flex justify-center items-center`}>
                <Icon className="w-12 h-12 text-white opacity-90" />
              </div>
              <div className="p-8">
                <h3 className="font-display text-xl font-bold tracking-tight text-[var(--text-main)] mb-3 group-hover:text-[var(--brilliant-blue)] transition-colors">
                  {card.title}
                </h3>
                <p className="text-[var(--text-muted)] font-bold text-[15px] mb-6">{card.description}</p>
                <div className="flex items-center justify-between font-bold text-sm">
                  <span className="text-[var(--text-muted)] bg-gray-50 px-3 py-1.5 rounded-lg border-2 border-[var(--border-light)]">{isLoading ? 'Loading…' : `${card.count} total`}</span>
                  <span className="text-[var(--brilliant-blue)] group-hover:underline">
                    Manage →
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="card-brilliant p-8">
        <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--text-main)] mb-6 border-b-2 border-[var(--border-light)] pb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/content/test-series?action=create"
            className="flex items-center gap-4 p-5 bg-white border-2 border-[var(--border-light)] rounded-2xl hover:-translate-y-1 shadow-[0_4px_0_var(--border-light)] active:translate-y-1 active:shadow-none transition-all group"
          >
            <div className="p-3 bg-purple-100 rounded-xl border-2 border-purple-200">
              <ClipboardList className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-bold text-[15px] text-[var(--text-main)] group-hover:text-[var(--brilliant-blue)] transition-colors">Create Test Series</p>
              <p className="text-sm font-semibold text-[var(--text-muted)]">New mock test</p>
            </div>
          </Link>
          <Link
            href="/admin/content/subjects"
            className="flex items-center gap-4 p-5 bg-white border-2 border-[var(--border-light)] rounded-2xl hover:-translate-y-1 shadow-[0_4px_0_var(--border-light)] active:translate-y-1 active:shadow-none transition-all group"
          >
            <div className="p-3 bg-green-100 rounded-xl border-2 border-green-200">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-[15px] text-[var(--text-main)] group-hover:text-[var(--brilliant-green)] transition-colors">Review Subjects</p>
              <p className="text-sm font-semibold text-[var(--text-muted)]">View live syllabus structure</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
