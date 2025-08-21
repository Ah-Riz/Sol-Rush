import Phaser from 'phaser';
import Leaderboard from '../javascript/leaderboard';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

export default class LeaderboardTable extends Phaser.Scene {
  constructor() {
    super('leaderboard-table');
  }

  init(data) {
    this.player = data.player;
    this.score = data.score;
    this.song = data.song;
    this.walletPublicKey = data.walletPublicKey;
    this.isExist = data.isExist;
  }

  preload() {
    this.width = this.scale.width;
    this.height = this.scale.height;
    const leaderboard = new Leaderboard();

    if (this.player && this.score && this.walletPublicKey && this.isExist) {
      leaderboard.saveScore(this.walletPublicKey, this.score);
    }
    this.leaderboard = leaderboard.getScores(this.walletPublicKey, this.player, this.score);
    console.log('ini '+this.leaderboard.toString());
  }

  create() {
    const title = this.make.text({
      x: this.width / 2,
      y: 50,
      text: 'LEADERBOARD',
      style: {
        fontSize: '100px',
        fill: '#fff200',
        fontFamily: 'Arcadia, monospace',
      },
    }).setOrigin(0.5, 0.5);

    this.sub = this.make.text({
      x: this.width / 2,
      y: title.y + 110,
      text: 'Rank       Player       Score',
      style: {
        fontSize: '50px',
        fill: '#003fff',
        fontFamily: 'Arcadia, monospace',
      },
    }).setOrigin(0.5, 0.5);

    this.time.delayedCall(1000, () => {
      this.leaderboard.then(result => {
        let prevRank;
        let prevName;
        let prevScore;

        for (let i = 0; i <= 4 && i < result.length; i += 1) {
          const { username, totalScore } = result[i];

          const rank = this.rankText(i + 1);
          const name = this.nameText(username);
          const scoreN = this.scoreText(totalScore);

          if (i >= 1) {
            rank.y = prevRank.y + 70;
            name.y = prevName.y + 70;
            scoreN.y = prevScore.y + 70;
          }

          prevRank = rank;
          prevName = name;
          prevScore = scoreN;
        }

        if (this.player && this.score) {
          for (let i = 0; i <= result.length - 1; i += 1) {
            const { username, totalScore } = result[i];

            if (username === this.player && parseInt(totalScore, 10) === this.score) {
              this.text = this.make.text({
                x: this.width / 5.7,
                y: this.height - 100,
                text: i + 1,
                style: {
                  fontSize: '60px',
                  fill: '#ffffff',
                  fontFamily: 'Arcadia, monospace',
                },
              }).setOrigin(0.5, 0.5);

              this.make.text({
                x: this.width / 2 - 20,
                y: this.height - 100,
                text: username,
                style: {
                  fontSize: '60px',
                  fill: '#ffffff',
                  fontFamily: 'Arcadia, monospace',
                },
              }).setOrigin(0.5, 0.5);

              this.make.text({
                x: this.width - 235,
                y: this.height - 100,
                text: totalScore,
                style: {
                  fontSize: '60px',
                  fill: '#ffffff',
                  fontFamily: 'Arcadia, monospace',
                },
              }).setOrigin(0.5, 0.5);
            }

            if (this.text) {
              break;
            }
          }
        }
      });
    });

    this.make.text({
      x: this.width / 2,
      y: this.height - 30,
      text: "[ Press 'ENTER' to continue... ]",
      style: {
        fontSize: '30px',
        fill: '#505050',
        fontFamily: 'Monogram, monospace',
        align: 'justify',
      },
    }).setOrigin(0.5, 0.5);

    const enter = this.input.keyboard.addKey('ENTER');
    enter.on('down', () => {
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.scene.start('credits', { song: this.song });
    });
  }

  rankText(rank) {
    return this.make.text({
      x: this.width / 5.7,
      y: this.sub.y + 75,
      text: rank,
      style: {
        fontSize: '30px',
        fill: '#ffffff',
        fontFamily: 'Arcadia, monospace',
      },
    }).setOrigin(0.5, 0.5);
  }

  nameText(player) {
    return this.make.text({
      x: this.width / 2 - 20,
      y: this.sub.y + 75,
      text: player,
      style: {
        fontSize: '30px',
        fill: '#ffffff',
        fontFamily: 'Arcadia, monospace',
      },
    }).setOrigin(0.5, 0.5);
  }

  scoreText(score) {
    return this.make.text({
      x: this.width - 235,
      y: this.sub.y + 75,
      text: score,
      style: {
        fontSize: '30px',
        fill: '#ffffff',
        fontFamily: 'Arcadia, monospace',
      },
    }).setOrigin(0.5, 0.5);
  }
}