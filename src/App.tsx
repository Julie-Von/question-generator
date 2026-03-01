import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QuizProvider } from './app/context/QuizContext'
import { AdminProvider } from './app/context/AdminContext'
import { ROUTES } from './app/routes'
import Home from './app/pages/Home'
import QuizConfig from './app/pages/QuizConfig'
import BrowseMode from './app/pages/BrowseMode'
import BattleMode from './app/pages/BattleMode'
import Result from './app/pages/Result'
import DuelMode from './app/pages/DuelMode'
import DuelResult from './app/pages/DuelResult'
import AdminLogin from './app/pages/AdminLogin'
import QuestionBank from './app/pages/admin/QuestionBank'
import AIGenerate from './app/pages/admin/AIGenerate'

export default function App() {
  return (
    <AdminProvider>
      <QuizProvider>
        <BrowserRouter>
          <Routes>
            <Route path={ROUTES.HOME} element={<Home />} />
            <Route path={ROUTES.QUIZ_CONFIG} element={<QuizConfig />} />
            <Route path={ROUTES.BROWSE} element={<BrowseMode />} />
            <Route path={ROUTES.BATTLE} element={<BattleMode />} />
            <Route path={ROUTES.RESULT} element={<Result />} />
            <Route path={ROUTES.DUEL} element={<DuelMode />} />
            <Route path={ROUTES.DUEL_RESULT} element={<DuelResult />} />
            <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />
            <Route path={ROUTES.QUESTION_BANK} element={<QuestionBank />} />
            <Route path={ROUTES.AI_GENERATE} element={<AIGenerate />} />
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
        </BrowserRouter>
      </QuizProvider>
    </AdminProvider>
  )
}
