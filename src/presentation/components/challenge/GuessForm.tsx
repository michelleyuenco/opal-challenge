import { useState } from 'react'
import type { Opal } from '@domain/entities/Opal'
import { Button } from '@presentation/components/ui/Button'
import { useSubmitGuess } from '@presentation/hooks/useSubmission'

interface GuessFormProps {
  opals: Opal[]
  challengeId: string
  userId: string
}

export function GuessForm({ opals, challengeId, userId }: GuessFormProps) {
  const [selectedOpalId, setSelectedOpalId] = useState<string | null>(null)
  const submitGuess = useSubmitGuess()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOpalId) return
    submitGuess.mutate({ userId, challengeId, guessedOpalId: selectedOpalId })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset>
        <legend className="text-sm font-medium text-gray-700">
          Which opal is shown in the challenge?
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {opals.map((opal) => (
            <label
              key={opal.id}
              className={`cursor-pointer rounded-lg border p-3 text-sm transition ${
                selectedOpalId === opal.id
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="opalGuess"
                value={opal.id}
                checked={selectedOpalId === opal.id}
                onChange={() => setSelectedOpalId(opal.id)}
                className="sr-only"
              />
              {opal.title}
            </label>
          ))}
        </div>
      </fieldset>

      {submitGuess.error && (
        <p className="text-sm text-red-600">{(submitGuess.error as Error).message}</p>
      )}

      {submitGuess.isSuccess && (
        <p className="text-sm text-green-600">Your guess has been submitted!</p>
      )}

      <Button
        type="submit"
        disabled={!selectedOpalId}
        loading={submitGuess.isPending}
      >
        Submit Guess
      </Button>
    </form>
  )
}
