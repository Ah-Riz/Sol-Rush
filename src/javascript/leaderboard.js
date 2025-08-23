// require('regenerator-runtime/runtime');
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

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
    const { data, error } = await supabase
      .from('players')
      .insert([
        { wallet_address: playerWallet, username: player}
      ]);
  }

  async changePlayerUserName(playerWallet, player) {
    const { data, error } = await supabase
      .from('players')
      .update({ username: player, last_login: new Date().toISOString() })
      .eq('wallet_address', playerWallet);
  }

  async saveScore(playerWallet, score) {
    const { data, error } = await supabase
      .from('leaderboards')
      .insert([
        { wallet_address: playerWallet, score: score}
      ]);
  }

  async getTop5() {
    // Get the current date and calculate the start of the week (Monday)
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const monday = new Date(now);
    
    // Set to Monday of current week
    monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    monday.setHours(0, 0, 0, 0);
    
    // Set to next Sunday 23:59:59.999
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Format dates to ISO string for Supabase
    const mondayISO = monday.toISOString();
    const sundayISO = sunday.toISOString();

    // First, get all scores grouped by player for current week
    const { data: allScores, error } = await supabase
      .from('leaderboards')
      .select('wallet_address, score, players(username), created_at')
      .gte('created_at', mondayISO)
      .lte('created_at', sundayISO);
      
    if (error) {
      console.error('Error fetching scores:', error);
      return [];
    }

    // Accumulate scores by player
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

    // Convert to array, sort by total score, and take top 10
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
    // Get last week's Monday to Sunday
    const now = new Date();
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7); // Go back one week
    
    const lastWeekDay = lastWeek.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const lastWeekMonday = new Date(lastWeek);
    
    // Set to Monday of last week
    lastWeekMonday.setDate(lastWeek.getDate() - (lastWeekDay === 0 ? 6 : lastWeekDay - 1));
    lastWeekMonday.setHours(0, 0, 0, 0);
    
    // Set to last week's Sunday 23:59:59.999
    const lastWeekSunday = new Date(lastWeekMonday);
    lastWeekSunday.setDate(lastWeekMonday.getDate() + 6);
    lastWeekSunday.setHours(23, 59, 59, 999);
  
    // Format dates to ISO string for Supabase
    const mondayISO = lastWeekMonday.toISOString();
    const sundayISO = lastWeekSunday.toISOString();
  
    // Get all scores from last week
    const { data: allScores, error } = await supabase
      .from('leaderboards')
      .select('wallet_address, score, players(username), created_at')
      .gte('created_at', mondayISO)
      .lte('created_at', sundayISO);
      
    if (error || !allScores) {
      console.error('Error fetching last week scores:', error);
      return false;
    }
  
    // Accumulate scores by player
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
  
    // Convert to array, sort by total score, and take top 5
    const sortedPlayers = Object.entries(playerScores)
      .sort(([, a], [, b]) => b.totalScore - a.totalScore)
      .slice(0, 5);
  
    // Find the player's position (1-based index)
    const playerIndex = sortedPlayers.findIndex(([wallet]) => wallet === playerWallet);
    
    // Return position (1-5) if found in top 5, otherwise false
    return playerIndex !== -1 ? playerIndex + 1 : false;
  }
}