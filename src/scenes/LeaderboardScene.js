import Phaser from 'phaser';
import Leaderboard from '../javascript/leaderboard';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

export default class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super('leaderboard-scene');
  }

  init(data) {
    this.subScore = data.score;
    this.kills = data.kills;
    this.ending = data.song;
  }

  preload() {
    this.width = this.scale.width;
    this.height = this.scale.height;
  }

  async create() {
    
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    this.totalScore = this.subScore + this.kills * 10;

    this.make.text({
      x: this.width / 2,
      y: this.height / 2 - 150,
      text: `Total Score\n${this.totalScore}`,
      style: {
        fontSize: '60px',
        fill: '#ffffff',
        fontFamily: 'Arcadia, monospace',
        align: 'center',
      },
    }).setOrigin(0.5, 0.5);

    this.make.text({
      x: this.width / 2,
      y: this.height / 2,
      text: `Score: ${this.subScore} | Kills: ${this.kills}`,
      style: {
        fontSize: '30px',
        fill: '#ffffff',
        fontFamily: 'Arcadia, monospace',
      },
    }).setOrigin(0.5, 0.5);

    const keys = this.input.keyboard.addKeys({
      space: 'SPACE',
      a: 'A',
      s: 'S',
      w: 'W',
      enter: 'ENTER',
    });

    const input = this.add.text(this.width / 2, this.height / 2 + 100, 'Your Nickname', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#666666',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 0.5).setInteractive();

    let playerName = '';
    let isTyping = true;

    this.input.keyboard.on('keydown', (event) => {
      if (!isTyping) return;

      if (event.key === 'Backspace') {
        playerName = playerName.slice(0, -1);
      } 
      else if (event.key === 'Enter') {
        this.submitScore(playerName);
        return;
      }
      else if (event.key.length === 1) {
        playerName += event.key;
      }

      input.setText(playerName || 'Your Nickname');
    });

    input.on('pointerdown', () => {
      isTyping = true;
      input.setStyle({ backgroundColor: '#888888' });
    });

    this.submitScore = (name) => {
      if (!name.trim()) return;
      isTyping = false;
      input.setStyle({ backgroundColor: '#666666' });
      
      let walletPublicKey = null;
      let isExist = false;

      const titleScene = this.scene.get('title-screen');
      if (titleScene && titleScene.walletPublicKey) {
        walletPublicKey = titleScene.walletPublicKey.toString();
        const leaderboard = new Leaderboard();
        isExist = leaderboard.isWalletExist(walletPublicKey);
        if (isExist) {
          leaderboard.changePlayerUserName(walletPublicKey, name);
        } else {
          leaderboard.addNewPlayer(walletPublicKey, name, this.totalScore);
        }
      } else {
        leaderboard.addNewPlayer('anonymous', name, this.totalScore);
      }

      this.cameras.main.fadeOut(1000, 0, 0, 0);

      this.scene.start('leaderboard-table', { 
        player: name, 
        score: this.totalScore, 
        song: this.ending, 
        walletPublicKey, 
        isExist 
      });
    };
  }
}