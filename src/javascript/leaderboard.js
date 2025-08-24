import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)


export default class Leaderboard {

  async isWalletExist(playerWallet) {
    const { data, error } = await supabase
      .from('players')
      .select('wallet_address')
      .eq('wallet_address', playerWallet);

    if (data.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  async insertNewPlayer(playerWallet, player) {
    await supabase
      .from('players')
      .insert([
        { wallet_address: playerWallet, username: player}
      ]);
  }

  async changePlayerUserName(playerWallet, player) {
    await supabase
      .from('players')
      .update({ username: player, last_login: new Date().toISOString() })
      .eq('wallet_address', playerWallet);
  }

  async saveScore(playerWallet, score) {
    await supabase
      .from('leaderboards')
      .insert([
        { wallet_address: playerWallet, score: score}
      ]);
  }

  async getTop5() {
    const now = new Date();

    const currentDay = now.getDay(); 
    const monday = new Date(now);
    
    monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const mondayISO = monday.toISOString();
    const sundayISO = sunday.toISOString();

    const { data: allScores } = await supabase
      .from('leaderboards')
      .select('wallet_address, score, players(username), created_at')
      .gte('created_at', mondayISO)
      .lte('created_at', sundayISO);
      
    const playerScores = {};
    allScores.forEach(({ wallet_address, score, players }) => {
      if (!playerScores[wallet_address]) {
        playerScores[wallet_address] = {
          username: players?.username || 'Anonymous',
          totalScore: 0
        };
      }
      playerScores[wallet_address].totalScore += score;
    });

    const sortedPlayers = Object.values(playerScores)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5);
    return sortedPlayers;
  }

  async getScores(playerWallet, player, score) {
    const leaderboard = await this.getTop5();
    return leaderboard;
  }

  async getLastWeekPosition(playerWallet) {
    const now = new Date();
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7); 
    
    const lastWeekDay = lastWeek.getDay(); 
    const lastWeekMonday = new Date(lastWeek);
    
    lastWeekMonday.setDate(lastWeek.getDate() - (lastWeekDay === 0 ? 6 : lastWeekDay - 1));
    lastWeekMonday.setHours(0, 0, 0, 0);
    
    const lastWeekSunday = new Date(lastWeekMonday);
    lastWeekSunday.setDate(lastWeekMonday.getDate() + 6);
    lastWeekSunday.setHours(23, 59, 59, 999);
  
    const mondayISO = lastWeekMonday.toISOString();
    const sundayISO = lastWeekSunday.toISOString();
  
    const { data: allScores } = await supabase
      .from('leaderboards')
      .select('wallet_address, score, players(username), created_at')
      .gte('created_at', mondayISO)
      .lte('created_at', sundayISO);
  
    const playerScores = {};
    allScores.forEach(({ wallet_address, score, players }) => {
      if (!playerScores[wallet_address]) {
        playerScores[wallet_address] = {
          username: players?.username || 'Anonymous',
          totalScore: 0
        };
      }
      playerScores[wallet_address].totalScore += score;
    });
  
    const sortedPlayers = Object.entries(playerScores)
      .sort(([, a], [, b]) => b.totalScore - a.totalScore)
      .slice(0, 5);
  
    const playerIndex = sortedPlayers.findIndex(([wallet]) => wallet === playerWallet);
    
    return playerIndex !== -1 ? playerIndex + 1 : false;
  }
}