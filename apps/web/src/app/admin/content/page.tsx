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
        <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
        <p className="text-gray-600">Manage all platform content - subjects, topics, lessons, questions, and tests</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 text-sm text-gray-600">
        Live counts are shown for resources with real backend APIs. Question-bank admin endpoints are not currently exposed, so that section is hidden from the main admin workflow.
      </div>

      {/* Pending Review Alert */}
      {stats.pendingReview > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-yellow-800">Items Pending Review</p>
              <p className="text-sm text-yellow-600">{stats.pendingReview} items need review before publishing</p>
            </div>
          </div>
          <Link
            href="/admin/content?filter=review"
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm font-medium"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {contentCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${card.bgColor} p-2 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${card.textColor}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition" />
              </div>
              <h3 className="font-semibold text-gray-900">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{isLoading ? '...' : card.count.toLocaleString()}</p>
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
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group"
            >
              <div className={`${card.color} p-6`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{card.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{isLoading ? 'Loading…' : `${card.count} total`}</span>
                  <span className="text-sm font-medium text-primary-600 group-hover:underline">
                    Manage →
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/content/test-series?action=create"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="p-2 bg-purple-100 rounded-lg">
              <ClipboardList className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Create Test Series</p>
              <p className="text-sm text-gray-500">New mock test</p>
            </div>
          </Link>
          <Link
            href="/admin/content/subjects"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Review Subjects</p>
              <p className="text-sm text-gray-500">View live syllabus structure</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
