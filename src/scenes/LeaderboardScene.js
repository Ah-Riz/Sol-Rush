import Phaser from 'phaser';
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
    
    async function saveHighScore(playerWallet, score) {
      const { data, error } = await supabase
        .from('leaderboards')
        .insert([
          { wallet_address: playerWallet, score: score}
        ]);
    }

    async function isWalletExist(playerWallet) {
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

    async function insertNewPlayer(playerWallet, player) {
      const { data, error } = await supabase
        .from('players')
        .insert([
          { wallet_address: playerWallet, username: player}
        ]);
    }

    async function changePlayerUserName(playerWallet, player) {
      const { data, error } = await supabase
        .from('players')
        .update({ username: player, last_login: new Date().toISOString() })
        .eq('wallet_address', playerWallet);
    }
    
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    this.totalScore = this.subScore + this.kills * 1000;

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

    keys.a.on('down', (e) => {
      e.preventDefault();
    });

    keys.s.on('down', (e) => {
      e.preventDefault();
    });

    keys.enter.on('down', (e) => {
      e.preventDefault();
    });

    keys.space.on('down', (e) => {
      e.preventDefault();
    });

    keys.w.on('down', (e) => {
      e.preventDefault();
    });


    const element = this.add.dom(this.width / 2, this.height / 2 + 100).createFromHTML('<input class="playerInput" type="text" placeholder="Your Nickname" name="player">', 'form');

    const form = document.querySelector('form');
    const input = document.querySelector('input');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form).entries();
      const { player } = Object.fromEntries(formData);

      if (player === '') {
        input.value = '';
        input.placeholder = 'PLEASE ENTER A NICKNAME';
        input.classList.add('input-warning');
      } else {

        const titleScene = this.scene.get('title-screen');
        if (titleScene && titleScene.walletPublicKey) {
          const walletPublicKey = titleScene.walletPublicKey.toString();
          const isExist = await isWalletExist(walletPublicKey);
          console.log(isExist);
          if (isExist) {
            await changePlayerUserName(walletPublicKey, player);
          } else {
            await insertNewPlayer(walletPublicKey, player);
          }
          await saveHighScore(walletPublicKey, this.totalScore);

        }



        element.destroy();

        this.cameras.main.fadeOut(1000, 0, 0, 0);

        this.scene.start('leaderboard-table', { player, score: this.totalScore, song: this.ending });
      }
    });
  }
}