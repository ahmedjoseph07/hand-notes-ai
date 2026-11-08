'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, RotateCcw, Trophy, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/feedback/EmptyState'
import { saveQuizScore } from '@/features/notes/notes-actions'
import { useHotkeys } from '@/hooks/use-hotkeys'
import { cn } from '@/lib/utils'
import type { QuizQuestion } from '@/types'

/** One-question-at-a-time quiz with instant feedback; 1–4 picks an answer, Enter continues */
export function QuizRunner({ noteSlug, questions, bestScore }: { noteSlug: string; questions: readonly QuizQuestion[]; bestScore: number | null }) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [finished, setFinished] = useState(false)
  const [best, setBest] = useState(bestScore)
  const [, startTransition] = useTransition()

  const question = questions[index]

  const pick = (i: number) => {
    if (picked !== null || !question || i >= question.options.length) return
    setPicked(i)
    if (i === question.answerIndex) setCorrect((c) => c + 1)
  }
  const next = () => {
    if (picked === null) return
    if (index + 1 >= questions.length) {
      setFinished(true)
      const score = Math.round((correct / questions.length) * 100)
      startTransition(async () => {
        const result = await saveQuizScore(noteSlug, score)
        if (result.ok) setBest(result.data.best)
      })
    } else {
      setIndex((i) => i + 1)
      setPicked(null)
    }
  }
  const restart = () => {
    setIndex(0)
    setPicked(null)
    setCorrect(0)
    setFinished(false)
  }

  useHotkeys('1', () => pick(0), { enabled: !finished })
  useHotkeys('2', () => pick(1), { enabled: !finished })
  useHotkeys('3', () => pick(2), { enabled: !finished })
  useHotkeys('4', () => pick(3), { enabled: !finished })
  useHotkeys('enter', next, { enabled: picked !== null && !finished })

  if (questions.length === 0) {
    return <EmptyState size='compact' title='No quiz for this note yet' description='Quizzes are generated with the study set. Upload a clearer page or add more content to get one.' />
  }

  if (finished) {
    const score = Math.round((correct / questions.length) * 100)
    return (
      <div className='flex flex-col items-center gap-3 rounded-[14px] border border-[var(--border-subtle)] bg-white px-6 py-10 text-center'>
        <Trophy className='size-10 text-[var(--warning)]' aria-hidden />
        <h3 className='font-serif text-2xl font-semibold'>
          {correct} of {questions.length} correct
        </h3>
        <p className='text-[var(--text-secondary)]'>
          {score >= 80 ? 'Excellent: you know this well.' : score >= 50 ? 'Good progress. Review the flashcards and try again.' : 'Worth another pass through the summary first.'}
          {best !== null && ` Best score: ${best}%.`}
        </p>
        <Button variant='brand' size='lg' className='mt-2 h-11 px-5' onClick={restart}>
          <RotateCcw aria-hidden /> Try again
        </Button>
      </div>
    )
  }

  if (!question) return null

  return (
    <div className='rounded-[14px] border border-[var(--border-subtle)] bg-white p-5 sm:p-7'>
      <div className='mb-4 flex items-center justify-between text-sm text-[var(--text-secondary)]'>
        <span>
          Question {index + 1} of {questions.length}
        </span>
        {best !== null && <span>Best: {best}%</span>}
      </div>
      <div className='mb-5 h-1.5 overflow-hidden rounded-full bg-[var(--bg-secondary)]'>
        <div className='h-full rounded-full bg-[var(--color-brand)] transition-[width]' style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>
      <h3 className='font-serif text-xl font-semibold sm:text-2xl'>{question.prompt}</h3>
      <ul className='mt-5 space-y-2.5' role='list'>
        {question.options.map((option, i) => {
          const isAnswer = i === question.answerIndex
          const state = picked === null ? 'idle' : isAnswer ? 'correct' : picked === i ? 'wrong' : 'dim'
          return (
            <li key={option}>
              <button
                type='button'
                onClick={() => pick(i)}
                disabled={picked !== null}
                className={cn(
                  'flex min-h-12 w-full items-center gap-3 rounded-[12px] border-2 px-4 py-3 text-left text-[15px] font-medium transition-colors',
                  state === 'idle' && 'border-[var(--border-subtle)] hover:border-[var(--text-primary)]',
                  state === 'correct' && 'border-[var(--success)] bg-[color-mix(in_oklab,var(--success)_12%,white)]',
                  state === 'wrong' && 'border-[var(--destructive)] bg-[var(--destructive)]/8',
                  state === 'dim' && 'border-[var(--border-subtle)] opacity-60',
                )}
              >
                <span className='inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-sm font-semibold'>{i + 1}</span>
                <span className='flex-1'>{option}</span>
                {state === 'correct' && <CheckCircle2 className='size-5 text-[var(--success)]' aria-label='Correct answer' />}
                {state === 'wrong' && <XCircle className='size-5 text-[var(--destructive)]' aria-label='Your answer' />}
              </button>
            </li>
          )
        })}
      </ul>
      {picked !== null && (
        <div className='mt-5 flex flex-col gap-4 rounded-[12px] bg-[var(--bg-tertiary)] p-4 sm:flex-row sm:items-center' aria-live='polite'>
          <p className='flex-1 text-[15px]'>
            <strong>{picked === question.answerIndex ? 'Correct. ' : 'Not quite. '}</strong>
            {question.explanation}
          </p>
          <Button variant='brand' size='lg' className='h-10 px-4' onClick={next} autoFocus>
            {index + 1 >= questions.length ? 'See results' : 'Next question'}
          </Button>
        </div>
      )}
    </div>
  )
}
