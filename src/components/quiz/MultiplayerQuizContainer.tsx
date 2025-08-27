
import React from 'react';

import { EnhancedMultiplayerQuizGame } from './EnhancedMultiplayerQuizGame';
import { MultiplayerQuizWaitingRoom } from './MultiplayerQuizWaitingRoom';
import { MultiplayerQuizLobby } from './MultiplayerQuizLobby';
import { MultiplayerQuizResults } from './MultiplayerQuizResults';
import { useMultiplayerQuiz } from '@/hooks/useMultiplayerQuiz';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

export const MultiplayerQuizContainer = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    gameState,
    room,
    players,
    currentQuestion,
    timeLeft,
    selectedAnswer,
    showResults,
    finalResults,
    publicRooms,
    questions,
    categories,
    findMatch,
    cancelMatch,
    submitAnswer,
    createRoom,
    joinRoomByCode,
    joinPublicRoom,
    leaveRoom,
    startGame,
    fetchPublicRooms,
    debugMatchmakingStatus,
    checkAndStartGame
  } = useMultiplayerQuiz();

  const handleCreateRoom = async (maxPlayers: number, isPublic: boolean, category?: string, questionCount?: number) => {
    return await createRoom(maxPlayers, isPublic, category, questionCount);
  };

  const handleFindMatch = async (category?: string) => {
    await findMatch(category);
  };

  // Show lobby when game state is idle (not in any room)
  if (gameState === 'idle' || gameState === 'finding') {
    return (
      <MultiplayerQuizLobby
        gameState={gameState}
        publicRooms={publicRooms}
        categories={categories}
        onFindMatch={handleFindMatch}
        onCancelMatch={cancelMatch}
        onCreateRoom={handleCreateRoom}
        onJoinRoomByCode={joinRoomByCode}
        onJoinPublicRoom={joinPublicRoom}
        onRefreshRooms={fetchPublicRooms}
      />
    );
  }

  // Show waiting room when matched but game hasn't started
  if (gameState === 'matched' && room) {
    return (
      <MultiplayerQuizWaitingRoom
        room={room}
        players={players}
        onLeaveRoom={leaveRoom}
        onStartGame={startGame}
        currentUserId={user?.id || ''}
        onDebugStatus={debugMatchmakingStatus}
        onCheckAndStart={checkAndStartGame}
      />
    );
  }

  // Show results screen
  if (gameState === 'results' || showResults) {
    return (
      <MultiplayerQuizResults
        players={finalResults.length > 0 ? finalResults : players}
        onPlayAgain={() => window.location.reload()}
        onLeaveRoom={leaveRoom}
        currentUserId={user?.id || ''}
        room={room}
        questions={questions}
      />
    );
  }

  // Show game screen
  if ((gameState === 'countdown' || gameState === 'playing') && currentQuestion && room) {
    const currentQuestionIndex = room.current_question_index || 0;
    const totalQuestions = questions.length || 10;

    return (
      <EnhancedMultiplayerQuizGame
        question={currentQuestion}
        timeLeft={timeLeft}
        players={players}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={submitAnswer}
        gameState={gameState}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        onLeave={leaveRoom}
        currentUserId={user?.id || ''}
      />
    );
  }

  // Fallback to lobby
  return (
    <MultiplayerQuizLobby
      gameState={gameState}
      publicRooms={publicRooms}
      categories={categories}
      onFindMatch={handleFindMatch}
      onCancelMatch={cancelMatch}
      onCreateRoom={handleCreateRoom}
      onJoinRoomByCode={joinRoomByCode}
      onJoinPublicRoom={joinPublicRoom}
      onRefreshRooms={fetchPublicRooms}
    />
  );
};
