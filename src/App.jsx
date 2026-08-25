import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Cookies from 'js-cookie'
import './App.css'

const questions = [
  {
    id: 1,
    question: "Quel Aliment ne mange-t-il pas ?",
    options: ["le camenbert", "la salade verte", "l'entrecôte"],
    correctAnswer: "la salade verte"
  },
  {
    id: 2,
    question: "Quel sport a-t-il pratiqué ?",
    options: ["le Football", "Le Tennis", "la Moto-cross", "la natation"],
    correctAnswer: "la Moto-cross"
  },
  {
    id: 3,
    question: "Quel est son dernier voyage ?",
    options: ["le Sénégal", "le Canada", "la Russie", "la Thaîlande"],
    correctAnswer: "la Thaîlande"
  },
  {
    id: 4,
    question: "Combien a-t-il de petits-enfants ?",
    options: ["5", "6", "7", "8"],
    correctAnswer: "7"
  },
  {
    id: 5,
    question: "Quel est son deuxième prénom ?",
    options: ["Christiant", "Bernard", "Jean", "Marcel"],
    correctAnswer: "Christiant"
  },
  {
    id: 6,
    question: "Quelle est sa gourmandise préférée ?",
    options: ["la Glace", "le Chocolat", "Cookies", "Barbapapa"],
    correctAnswer: "le chocolat"
  },
  {
    id: 7,
    question: "Quelle est la marque de sa première voiture ?",
    options: ["Peugeot", "Citroën", "Renault", "Mercedes"],
    correctAnswer: "Peugeot"
  },
  {
    id: 8,
    question: "Combien de Km a parcouru la personne la plus éloignée pour venir aujourd'hui ?",
    options: ["165", "285", "212", "331"],
    correctAnswer: "285"
  },
  {
    id: 9,
    question: "Quelle est sa date de naissance ?",
    options: ["08/08/1958", "29/08/1956", "22/08/1956", "29/07/1956"],
    correctAnswer: "22/08/1956"
  },
  {
    id: 10,
    question: "Quels sont les prénoms de ses chiens ?",
    options: ["Ninja et Donatelo", "Ninja et Michel", "Ninja et Biaska", "Ninja et Sam"],
    correctAnswer: "Ninja et Biaska"
  },
  {
    id: 11,
    question: "Quel permis Joël n'a-t-il pas ?",
    options: ["transport en commun", "Super Poids lourd", "Permis B", "Bateau"],
    correctAnswer: "Bateau"
  },
  {
    id: 12,
    question: "Quel type de style a-t-il eu ?",
    options: ["Coupe mulet", "Barbe", "Cheveux longs", "Moustache"],
    correctAnswer: "Moustache"
  },
  {
    id: 13,
    question: "Combien de personnes sommes-nous aujourd'hui pour venir fêter ses 70 ans ?",
    options: ["111", "112", "113", "114"],
    correctAnswer: "112"
  },
  {
    id: 14,
    question: "Quelle est la marque de sa première moto ?",
    options: ["Ducati", "Suzuki", "BMW", "Laverda"],
    correctAnswer: "Laverda"
  },
  {
    id: 15,
    question: "Quelle est sa boisson préférée ?",
    options: ["Jus d'orange", "Bierre", "Rouge", "Whisky"],
    correctAnswer: "Whisky"
  },
  {
    id: 16,
    question: "Quel succès cinématographique français est sorti l'année de ses 10 ans ?",
    options: ["La grande Vadrouille", "les demoiselles de rochefort", "James Bond", "Le Livre de la Jungle"],
    correctAnswer: "La grande Vadrouille"
  },
  {
    id: 17,
    question: "Quelle personne célèbre est née en aout 1956 ?",
    options: ["claire chazal", "Michel Bernier", "Tom Hanks", "Michael Jackson"],
    correctAnswer: "Michel Bernier"
  }
]

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [nickname, setNickname] = useState('')
  const [showNicknameInput, setShowNicknameInput] = useState(true)
  const [questionStartTime, setQuestionStartTime] = useState(null)
  const [answerTimes, setAnswerTimes] = useState({})
  const [answerConfirmed, setAnswerConfirmed] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)
  const supabaseUrl = 'https://oazuwqarromrkqlhikub.supabase.co'
  const supabaseKey = 'sb_publishable_EICud6uVMkxK96xqPrYsRg_0KDJOrVt'
  const [sending, setSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(null)

  const handleAnswer = (answer) => {
    if (answerConfirmed) return

    const timeSpent = questionStartTime ? Date.now() - questionStartTime : 0
    setAnswers({
      ...answers,
      [currentQuestion]: answer
    })
    setAnswerTimes({
      ...answerTimes,
      [currentQuestion]: timeSpent
    })
  }

  const handleConfirmAnswer = () => {
    if (selectedAnswer) {
      setAnswerConfirmed(true)
    }
  }

  const handleNext = () => {
    if (!answerConfirmed) return

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setAnswerConfirmed(false)
      setQuestionStartTime(Date.now())
    } else {
      setShowResults(true)
    }
  }

  const handleStartQuiz = () => {
    if (nickname.trim()) {
      setShowNicknameInput(false)
      setQuestionStartTime(Date.now())
    }
  }

  const calculateInternalScore = () => {
    let internalScore = 0
    const maxTimePerQuestion = 60000 // 60 secondes max par question
    const maxPointsPerQuestion = 100
    const minPointsPerQuestion = 10

    questions.forEach((q, index) => {
      const userAnswer = answers[index]
      const isCorrect = userAnswer === q.correctAnswer
      const timeSpent = answerTimes[index] || 0
      
      if (isCorrect) {
        // Score continu ultra-précis qui diminue chaque 0.01 seconde
        // Commence à 100 points, diminue de 0.015 points par 0.01 seconde (1.5 points/seconde)
        // Minimum 10 points après 60 secondes
        const decayRate = 0.015 // points par 0.01 seconde
        let points = maxPointsPerQuestion - (timeSpent / 10) * decayRate
        points = Math.max(minPointsPerQuestion, Math.min(maxPointsPerQuestion, points))
        
        internalScore += points
      }
    })

    return Math.round(internalScore)
  }

  const calculateResults = () => {
    let correct = 0
    let incorrect = 0
    const details = []

    questions.forEach((q, index) => {
      const userAnswer = answers[index]
      const isCorrect = userAnswer === q.correctAnswer
      if (isCorrect) {
        correct++
      } else {
        incorrect++
      }
      details.push({
        question: q.question,
        userAnswer: userAnswer || "Non répondu",
        correctAnswer: q.correctAnswer,
        isCorrect
      })
    })

    const internalScore = calculateInternalScore()

    return { correct, incorrect, total: questions.length, details, internalScore }
  }

  const sendToSupabase = async () => {
    setSending(true)
    setSendSuccess(null)

    const results = calculateResults()

    const supabase = createClient(supabaseUrl, supabaseKey)

    const submissionData = {
      nickname: nickname,
      score: results.correct,
      total_questions: results.total,
      percentage: Math.round((results.correct / results.total) * 100),
      internal_score: results.internalScore,
      answers: JSON.stringify(results.details),
      created_at: new Date().toISOString()
    }

    try {
      const { data, error } = await supabase
        .from('questionnaire_responses')
        .insert([submissionData])

      if (error) {
        setSendSuccess(false)
        throw error
      }

      setSendSuccess(true)
      Cookies.set('questionnaire_completed', 'true', { expires: 365 })
    } catch (error) {
      setSendSuccess(false)
      console.error('Erreur:', error)
    } finally {
      setSending(false)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setShowResults(false)
    setAnswerConfirmed(false)
    setSendSuccess(null)
    setNickname('')
    setShowNicknameInput(true)
    setQuestionStartTime(null)
    setAnswerTimes({})
  }

  useEffect(() => {
    const completed = Cookies.get('questionnaire_completed')
    if (completed) {
      setHasCompleted(true)
    }
  }, [])

  useEffect(() => {
    if (showResults && !sendSuccess && !sending) {
      sendToSupabase()
    }
  }, [showResults, sendSuccess, sending])

  useEffect(() => {
    if (!showNicknameInput && !showResults) {
      setQuestionStartTime(Date.now())
    }
  }, [currentQuestion, showNicknameInput, showResults])

  if (hasCompleted) {
    return (
      <div className="container">
        <div className="card">
          <h1 className="title">⚠️ Déjà complété</h1>
          <p className="subtitle">Vous avez déjà répondu à ce questionnaire sur cet appareil.</p>
        </div>
      </div>
    )
  }

  if (showNicknameInput) {
    return (
      <div className="container">
        <div className="card">
          <h1 className="title">👋 Bienvenue !</h1>
          <p className="subtitle">Entrez votre pseudo pour commencer le questionnaire</p>
          <input
            type="text"
            placeholder="Votre pseudo"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="nickname-input"
            onKeyPress={(e) => e.key === 'Enter' && handleStartQuiz()}
          />
          <button
            onClick={handleStartQuiz}
            disabled={!nickname.trim()}
            className="btn btn-primary"
          >
            Commencer →
          </button>
        </div>
      </div>
    )
  }

  if (showResults) {
    const results = calculateResults()
    const percentage = Math.round((results.correct / results.total) * 100)

    return (
      <div className="container">
        <div className="card">
          <h1 className="title">🎉 Merci !</h1>
          
          <div className="webhook-section">
            {sending && <p className="status-message">Envoi en cours...</p>}
            {sendSuccess === true && <p className="success-message">✓ Résultats envoyés !</p>}
            {sendSuccess === false && <p className="error-message">✗ Erreur lors de l'envoi</p>}
          </div>


        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const selectedAnswer = answers[currentQuestion]

  return (
    <div className="container">
      <div className="card">
        <div className="progress">
          <span className="progress-text">
            Question {currentQuestion + 1} / {questions.length}
          </span>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <h1 className="question">{question.question}</h1>

        <div className="options">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={answerConfirmed}
              className={`option ${selectedAnswer === option ? 'selected' : ''} ${answerConfirmed && selectedAnswer === option ? (selectedAnswer === question.correctAnswer ? 'correct' : 'incorrect') : ''}`}
            >
              {option}
            </button>
          ))}
        </div>

        {answerConfirmed && (
          <p className={`answer-feedback ${selectedAnswer === question.correctAnswer ? 'correct' : 'incorrect'}`} aria-live="polite">
            {selectedAnswer === question.correctAnswer ? 'Bonne réponse !' : 'Mauvaise réponse.'}
          </p>
        )}

        <div className="navigation">
          <button
            onClick={answerConfirmed ? handleNext : handleConfirmAnswer}
            disabled={!selectedAnswer}
            className="btn btn-primary"
          >
            {!answerConfirmed
              ? 'Confirmer ma réponse'
              : currentQuestion === questions.length - 1
                ? 'Voir les résultats'
                : 'Suivant →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
