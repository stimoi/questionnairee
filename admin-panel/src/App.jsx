import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import './App.css'

const supabaseUrl = 'https://oazuwqarromrkqlhikub.supabase.co'
const supabaseKey = 'sb_publishable_EICud6uVMkxK96xqPrYsRg_0KDJOrVt'
const supabase = createClient(supabaseUrl, supabaseKey)

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function App() {
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedResponse, setSelectedResponse] = useState(null)
  const [view, setView] = useState('dashboard')
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    fetchResponses()
  }, [])

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 4)
    }, 5000)
    return () => clearInterval(slideInterval)
  }, [])

  const fetchResponses = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('questionnaire_responses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur:', error)
    } else {
      setResponses(data || [])
    }
    setLoading(false)
  }

  const calculateStatistics = () => {
    if (!responses || responses.length === 0) return null

    const totalResponses = responses.length
    const averageScore = responses.reduce((sum, r) => sum + (r.score || 0), 0) / totalResponses
    const averagePercentage = responses.reduce((sum, r) => sum + (r.percentage || 0), 0) / totalResponses
    const averageInternalScore = responses.reduce((sum, r) => sum + (r.internal_score || 0), 0) / totalResponses
    const internalScores = responses.map(r => r.internal_score || 0)
    const bestInternalScore = internalScores.length > 0 ? Math.max(...internalScores) : 0
    const worstInternalScore = internalScores.length > 0 ? Math.min(...internalScores) : 0
    const top3 = [...responses].sort((a, b) => (b.internal_score || 0) - (a.internal_score || 0)).slice(0, 3)
    const worst3 = [...responses].sort((a, b) => (a.internal_score || 0) - (b.internal_score || 0)).slice(0, 3)

    const scoreDistribution = Array(18).fill(0)
    responses.forEach(r => {
      const score = r.score
      if (score >= 0 && score <= 17) scoreDistribution[score]++
    })

    const scoreDistributionData = scoreDistribution.map((count, score) => ({
      score: `${score}/17`,
      count,
      percentage: ((count / totalResponses) * 100).toFixed(1)
    }))

    const percentageRanges = {
      '0-20%': 0,
      '21-40%': 0,
      '41-60%': 0,
      '61-80%': 0,
      '81-100%': 0
    }

    responses.forEach(r => {
      const pct = r.percentage
      if (pct <= 20) percentageRanges['0-20%']++
      else if (pct <= 40) percentageRanges['21-40%']++
      else if (pct <= 60) percentageRanges['41-60%']++
      else if (pct <= 80) percentageRanges['61-80%']++
      else percentageRanges['81-100%']++
    })

    const percentageDistributionData = Object.entries(percentageRanges).map(([range, count]) => ({
      range,
      count,
      percentage: ((count / totalResponses) * 100).toFixed(1)
    }))

    const questionStats = {}
    responses.forEach(r => {
      const answers = JSON.parse(r.answers)
      answers.forEach((a, idx) => {
        if (!questionStats[idx]) {
          questionStats[idx] = {
            question: a.question,
            correct: 0,
            total: 0
          }
        }
        questionStats[idx].total++
        if (a.isCorrect) questionStats[idx].correct++
      })
    })

    const questionStatsData = Object.values(questionStats).map(q => ({
      question: q.question.substring(0, 40) + '...',
      correctRate: ((q.correct / q.total) * 100).toFixed(1)
    }))

    // Find best and worst questions with ties
    const sortedQuestions = Object.values(questionStats).sort((a, b) => (b.correct / b.total) - (a.correct / a.total))
    const bestCorrectRate = sortedQuestions[0]?.correct / sortedQuestions[0]?.total || 0
    const worstCorrectRate = sortedQuestions[sortedQuestions.length - 1]?.correct / sortedQuestions[sortedQuestions.length - 1]?.total || 0
    
    const bestQuestions = sortedQuestions.filter(q => (q.correct / q.total) === bestCorrectRate).map(q => q.question)
    const worstQuestions = sortedQuestions.filter(q => (q.correct / q.total) === worstCorrectRate).map(q => q.question)

    const responsesOverTime = {}
    responses.forEach(r => {
      const date = new Date(r.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
      responsesOverTime[date] = (responsesOverTime[date] || 0) + 1
    })

    const timeSeriesData = Object.entries(responsesOverTime)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    return {
      totalResponses,
      averageScore: averageScore.toFixed(2),
      averagePercentage: averagePercentage.toFixed(1),
      averageInternalScore: averageInternalScore.toFixed(1),
      bestInternalScore,
      worstInternalScore,
      top3,
      worst3,
      bestQuestions,
      worstQuestions,
      scoreDistributionData,
      percentageDistributionData,
      questionStatsData,
      timeSeriesData
    }
  }

  const stats = calculateStatistics()

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Chargement...</div>
      </div>
    )
  }

  if (view === 'responses') {
    return (
      <div className="container">
        <div className="header">
          <h1>📋 Réponses</h1>
          <button onClick={() => setView('dashboard')} className="btn btn-secondary">
            ← Retour au dashboard
          </button>
        </div>

        <div className="responses-grid">
          {responses.map((response) => (
            <div key={response.id} className="response-card" onClick={() => setSelectedResponse(response)}>
              <div className="response-header">
                <span className="response-nickname">{response.nickname}</span>
                <span className="response-score">{response.score}/17</span>
                <span className="response-percentage">{response.percentage}%</span>
                <span className="response-internal-score">⚡ {response.internal_score || 0}</span>
              </div>
              <div className="response-date">
                {new Date(response.created_at).toLocaleString('fr-FR')}
              </div>
            </div>
          ))}
        </div>

        {selectedResponse && (
          <div className="modal" onClick={() => setSelectedResponse(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Détails de la réponse</h2>
                <button onClick={() => setSelectedResponse(null)} className="btn-close">×</button>
              </div>
              <div className="modal-body">
                <p><strong>Pseudo:</strong> {selectedResponse.nickname}</p>
                <p><strong>Score:</strong> {selectedResponse.score}/17 ({selectedResponse.percentage}%)</p>
                <p><strong>Score interne (temps):</strong> ⚡ {selectedResponse.internal_score || 0}</p>
                <p><strong>Date:</strong> {new Date(selectedResponse.created_at).toLocaleString('fr-FR')}</p>
                <h3>Réponses détaillées:</h3>
                {JSON.parse(selectedResponse.answers).map((answer, idx) => (
                  <div key={idx} className={`answer-detail ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                    <p><strong>Question {idx + 1}:</strong> {answer.question}</p>
                    <p>Votre réponse: {answer.userAnswer}</p>
                    {!answer.isCorrect && <p>Bonne réponse: {answer.correctAnswer}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>📊 Panel Admin - Questionnaire</h1>
        <button onClick={() => setView('responses')} className="btn btn-primary">
          Voir toutes les réponses
        </button>
      </div>

      {!stats ? (
        <div className="empty-state">
          <p>Aucune réponse pour le moment</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total des réponses</h3>
              <p className="stat-value">{stats.totalResponses}</p>
            </div>
            <div className="stat-card">
              <h3>Score moyen</h3>
              <p className="stat-value">{stats.averageScore}/17</p>
            </div>
            <div className="stat-card">
              <h3>Pourcentage moyen</h3>
              <p className="stat-value">{stats.averagePercentage}%</p>
            </div>
            <div className="stat-card">
              <h3>Score interne moyen</h3>
              <p className="stat-value">⚡ {stats.averageInternalScore}</p>
            </div>
            <div className="stat-card">
              <h3>Meilleur score interne</h3>
              <p className="stat-value">⚡ {stats.bestInternalScore}</p>
            </div>
            <div className="stat-card">
              <h3>Pire score interne</h3>
              <p className="stat-value">⚡ {stats.worstInternalScore}</p>
            </div>
          </div>

          <div className="leaderboard-section">
            <h3>🏆 Top 3 (Score interne)</h3>
            <div className="leaderboard">
              {stats.top3.map((entry, index) => (
                <div key={entry.id} className={`leaderboard-item rank-${index + 1}`}>
                  <span className="rank">#{index + 1}</span>
                  <span className="player-name">{entry.nickname}</span>
                  <span className="player-score">⚡ {entry.internal_score}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="leaderboard-section">
            <h3>💩 Flop 3 (Score interne)</h3>
            <div className="leaderboard">
              {stats.worst3.map((entry, index) => (
                <div key={entry.id} className={`leaderboard-item worst-rank-${index + 1}`}>
                  <span className="rank">#{index + 1}</span>
                  <span className="player-name">{entry.nickname}</span>
                  <span className="player-score">⚡ {entry.internal_score}</span>
                </div>
              ))}
            </div>
          </div>

          {stats && (
            <div className="fun-stats-section">
              <h3>🎭 Statistiques Loufoques</h3>
              <div className="slideshow-container">
                <div className="slideshow">
                  <div className={`slide ${currentSlide === 0 ? 'active' : ''}`}>
                    <div className="fun-stat-card large">
                      <h4>🌟 Question(s) la plus réussie</h4>
                      <p>{stats.bestQuestions?.join(', ') || 'N/A'}</p>
                    </div>
                  </div>
                  <div className={`slide ${currentSlide === 1 ? 'active' : ''}`}>
                    <div className="fun-stat-card large">
                      <h4>😱 Question(s) la moins réussie</h4>
                      <p>{stats.worstQuestions?.join(', ') || 'N/A'}</p>
                    </div>
                  </div>
                  <div className={`slide ${currentSlide === 2 ? 'active' : ''}`}>
                    <div className="fun-stat-card large">
                      <h4>🏆 Meilleur score interne</h4>
                      <p>⚡ {stats.bestInternalScore || 0} points</p>
                    </div>
                  </div>
                  <div className={`slide ${currentSlide === 3 ? 'active' : ''}`}>
                    <div className="fun-stat-card large">
                      <h4>💩 Pire score interne</h4>
                      <p>⚡ {stats.worstInternalScore || 0} points</p>
                    </div>
                  </div>
                </div>
                <div className="slideshow-dots">
                  {[0, 1, 2, 3].map(idx => (
                    <div 
                      key={idx} 
                      className={`dot ${currentSlide === idx ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(idx)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="charts-grid">
            <div className="chart-card">
              <h3>Distribution des scores</h3>
              {stats.scoreDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.scoreDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="score" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="no-data">Pas de données</p>
              )}
            </div>

            <div className="chart-card">
              <h3>Distribution des pourcentages</h3>
              {stats.percentageDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.percentageDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, percentage }) => `${range}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats.percentageDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="no-data">Pas de données</p>
              )}
            </div>

            <div className="chart-card full-width">
              <h3>Taux de réussite par question</h3>
              {stats.questionStatsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.questionStatsData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis dataKey="question" type="category" width={200} stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Bar dataKey="correctRate" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="no-data">Pas de données</p>
              )}
            </div>

            <div className="chart-card full-width">
              <h3>Réponses au fil du temps</h3>
              {stats.timeSeriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="no-data">Pas de données</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default App
