import React, { useContext } from 'react';
import * as S from './styled';
import { ButtonCreateRoom, ButtonAutoMatch } from '@/components/Button/Button.games';
import { GameContext } from '@/contexts/game.context';
import Square from '@/modules/Home/components/Square';
import { IRole } from '@/interfaces/useGetGameSttate';
import Text from '@/components/Text';
import { WalletContext } from '@/contexts/wallet.context';
import { ellipsisCenter } from 'tc-formatter';
import Spinner from '@/components/Spinner';
import { AssetsContext } from '@/contexts/assets.context';
import { CDN_URL_ICONS } from '@/configs';
import BannerImage from '@/images/banner.png';
import ButtonLogin from '@/components/ButtonLogin';
import { motion } from 'framer-motion';
import IconSVG from '@/components/IconSVG';
import ButtonEndMatch from '@/components/ButtonEndMatch';
import ButtonCancelFind from '@/components/ButtonCancelFind';
import { FaucetContext } from '@/contexts/faucet.context';

const DashBoard = React.memo(() => {
  const { setShowCreateRoom, setShowAutoMatchRoom, gameInfo, turn, loading, playerState, loadedPlayerState } =
    useContext(GameContext);
  const { keySet, walletState } = useContext(WalletContext);
  const { isNeedTopupTC } = useContext(AssetsContext);
  const { setShow: setShowFaucet } = useContext(FaucetContext);

  const isMyTurn = React.useMemo(() => {
    return turn === gameInfo?.myTurn;
  }, [turn, gameInfo]);

  const turnColor = React.useMemo(() => {
    return {
      myTurn: gameInfo?.myTurn === IRole.X ? '#62fffc' : '#ffa02e',
      yourTurn: gameInfo?.myTurn === IRole.X ? '#ffa02e' : '#62fffc',
    };
  }, [gameInfo]);

  const renderWarning = () => {
    return (
      isNeedTopupTC && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="warning-wrapper">
          <p style={{ textAlign: 'center' }}>
            <span onClick={() => setShowFaucet(true)}>Get TC from faucet to play game</span>
          </p>
        </motion.div>
      )
    );
  };

  const renderActions = () => {
    const isFinding = !gameInfo?.gameID && playerState.isFinding;
    const isPlaying = !gameInfo?.gameID && playerState.isPlaying;

    const isDisabled = isFinding || isPlaying || isNeedTopupTC || walletState.isNeedCreate || walletState.isNeedLogin;

    const isShowAction = !isPlaying && !isFinding;

    return (
      <div>
        {isFinding && renderCancelFinding()}
        {isPlaying && renderCancelPlaying()}
        <S.Actions initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ scale: 0, opacity: 0 }}>
          {isPlaying && <ButtonEndMatch />}
          {isFinding && <ButtonCancelFind />}
          {isShowAction && (
            <ButtonCreateRoom
              leftIcon={<IconSVG src={`${CDN_URL_ICONS}/ic-plus-square.svg`} />}
              disabled={isDisabled}
              onClick={() => {
                setShowCreateRoom(true);
              }}
            >
              Create Room
            </ButtonCreateRoom>
          )}
          {isShowAction && (
            <ButtonAutoMatch
              leftIcon={<IconSVG src={`${CDN_URL_ICONS}/ic-friend.svg`} maxWidth="22" />}
              disabled={isDisabled}
              onClick={() => {
                setShowAutoMatchRoom(true);
              }}
            >
              Join Room
            </ButtonAutoMatch>
          )}
        </S.Actions>
      </div>
    );
  };
  const renderMatch = () => {
    if (!gameInfo) return;
    return (
      <S.MatchContent initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, opacity: 0 }}>
        <S.PlayerBox isMyTurn={isMyTurn} turnColor={turnColor.myTurn}>
          <div className="square-box">
            <Square ind="1" updateSquares={() => undefined} clsName={gameInfo.myTurn} />
          </div>
          <div>
            <Text fontWeight="semibold" size="24">
              <span className="address-highlight">(YOU)</span>
              {ellipsisCenter({ str: keySet.address, limit: 5 })}
            </Text>
            {isMyTurn && (
              <Text fontWeight="medium" size="14" className="moving-now" color="txt-secondary">
                Moving now...
              </Text>
            )}
          </div>
          {loading && <Spinner size={24} />}
        </S.PlayerBox>
        <S.PlayerBox isMyTurn={!isMyTurn} turnColor={turnColor.yourTurn}>
          <div className="square-box">
            <Square ind="2" updateSquares={() => undefined} clsName={gameInfo.myTurn === IRole.X ? IRole.O : IRole.X} />
          </div>
          <div>
            <Text fontWeight="semibold" size="24">
              {ellipsisCenter({ str: gameInfo.competitorAddress, limit: 5 })}
            </Text>
            {!isMyTurn && (
              <Text fontWeight="medium" size="14" className="moving-now" color="txt-secondary">
                Moving now...
              </Text>
            )}
          </div>
        </S.PlayerBox>
      </S.MatchContent>
    );
  };

  const renderCancelFinding = () => {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="warning-wrapper">
        <p>Waiting for challenger...</p>
      </motion.div>
    );
  };

  const renderCancelPlaying = () => {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="warning-wrapper">
        <p>You are in a match, please click cancel to play new game...</p>
      </motion.div>
    );
  };

  const renderContent = () => {
    if (!walletState.isLogged) return undefined;
    if (!loadedPlayerState)
      return (
        <div className="wrap-spinner">
          <Spinner />
        </div>
      );
    if (!gameInfo?.gameID) return renderActions();
    return renderMatch();
  };

  return (
    <S.Container>
      <S.Banner src={BannerImage} />
      <S.Box>
        <ButtonLogin />
        {renderWarning()}
        {renderContent()}
      </S.Box>
    </S.Container>
  );
});

export default DashBoard;