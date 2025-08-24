import Phaser from 'phaser';
import createAligned from '../javascript/createAligned';
import { getSolBalance,getSplTokenBalance} from "../blockchain/solana";
import { mintSPLToken } from "../blockchain/tokenService.js"; 
import Leaderboard from '../javascript/leaderboard';


export default class TitleScene extends Phaser.Scene {

  
  constructor() {
    super('title-screen');
    this.isProfileOpen = false;
    this.isNotAvailOpen = false;
    this.walletAddress = null;
    
  }

  preload() {
    this.width = this.scale.width;
    this.height = this.scale.height;
    this.addressToken = import.meta.env.ADDRESS_TOKEN;
    console.log("ADDRESS_TOKEN "+ADDRESS_TOKEN);
  }

  create() {
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    this.scene.pauseOnBlur = false;

    this.menuSong = this.sound.add('menu', { volume: 0.25, loop: true });
    this.menuSong.play();

    const bgh = this.textures.get('background').getSourceImage().height;

    this.add.tileSprite(0, this.height, this.width, bgh, 'background')
      .setOrigin(0, 1).setScrollFactor(0);

    this.bg1 = createAligned(this, -23, 'bgTree_1', true);
    this.bg3 = createAligned(this, -53, 'bgTree_2', true);
    this.bg4 = createAligned(this, -70, 'bgTree_3', true);
    this.bg6 = createAligned(this, -68, 'bgTree_4', true);
    this.bg8 = createAligned(this, 10, 'floor', true, -250);


    this.player = this.add.sprite(200, this.height - 95, 'player_rest');
    this.player.anims.play('rest');
  this.walletConnected = false; 
  this.walletPublicKey = null;
    const title = this.make.text({
      x: this.width / 2,
      y: this.height / 2 - 140,
      text: '  Sol Rush',
      style: {
        fontSize: '90px',
        fill: '#ff0000',
        fontFamily: 'slugsRacer , Regular',
      },
    });
    title.setOrigin(0.5, 0.5);

    const title2 = this.make.text({
      x: this.width / 2,
      y: this.height / 2 - 80,
      text: 'Endless Run',
      style: {
        fontSize: '40px',
        fill: '#ff91c3',
        fontFamily: 'Cyberpunks, Regular',
      },
    });
    title2.setOrigin(0.5, 0.5);

        this.balanceText = this.add.text(this.width - 20, 20, 'SOL: -  |  TOKEN: -', {
          fontSize: '20px',
          color: '#ffffff',
          fontFamily: 'Arcadia'
        }).setOrigin(1, 0);

        this.profileText = this.add.text(20, 20, 'Profile', {
          fontSize: '24px',
          color: '#00ffcc',
          fontFamily: 'orbitronlight',
          fontStyle: 'bold',
          backgroundColor: '#00000055', 
          padding: { left: 10, right: 10, top: 5, bottom: 5 }
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.profileIsPressed())
        .on('pointerup', () => {
          this.profileNotPressed();
          this.openProfile();  
        });

    this.walletBtn = this.add.image(this.width / 2, this.height / 2, 'wallet')
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5, 0.5)
      .on('pointerdown', () => this.walletIsPressed())
      .on('pointerup', () => {
        this.connectWallet();
      });


    this.playBtn = this.add.image(this.width / 2, this.height / 2, 'play').setInteractive({ useHandCursor: true }).setOrigin(0.5, 0.5)
      .on('pointerdown', () => this.playIsPressed())
      .on('pointerup', () => {
        this.playNotPressed();
        if (this.walletConnected) {
          this.start();
        } else {
          console.log("Wallet belum terkoneksi!");
          this.showWalletWarning();
        }
      });

this.showWalletWarning = function() {
  const warning = this.add.text(this.width / 2, this.height / 2 + 100,
    'Silakan konekkan wallet dulu!',
    { fontSize: '20px', fill: '#ff4444' }
  ).setOrigin(0.5);
  
  this.time.delayedCall(2000, () => warning.destroy(), [], this);
};
      this.playBtn.setVisible(false);
  

    this.exitBtn = this.add.image(this.width / 2, this.height / 2 + 100, 'exit').setInteractive({ useHandCursor: true }).setOrigin(0.5, 0.5)
      .on('pointerdown', () => this.exitIsPressed())
      .on('pointerup', () => {
        this.exitNotPressed();
        this.exit();
      });
      this.exitBtn.setVisible(false); 

    ['A', 'S', 'SPACE', 'ENTER'].forEach(key => {
      const keyP = this.input.keyboard.addKey(key);
      keyP.on('down', () => {
        if (this.walletConnected) this.start();

      });
    });


    const menuItems = [
      { label: "Multiplayer", color: "#00ccff", action: () => this.openNotAvailable() },
      { label: "Inventory",   color: "#00ff99", action: () => this.openNotAvailable() },
      { label: "Shop",        color: "#ffcc00", action: () => this.openNotAvailable() },
      { label: "Marketplace", color: "#ffaa00", action: () => this.openNotAvailable() }
    ];
    

    const spacing = 180;
    const baseY = 520;
    
    menuItems.forEach((item, i) => {
      const totalWidth = (menuItems.length - 1) * spacing;
      const startX = this.width / 2 - totalWidth / 2;
      const x = startX + i * spacing;
    
      const text = this.add.text(x, baseY, item.label, {
        fontSize: "26px",
        color: item.color,
        fontFamily: "orbitronlight",
        fontStyle: "bold",
        backgroundColor: "#00000055",
        padding: { left: 15, right: 15, top: 5, bottom: 5 }
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {})
      .on("pointerup", item.action);
    
    });
  }

  async connectWallet() {
    const provider = window.solana;
    if (provider && provider.isPhantom) {
      try {
        const resp = await provider.connect();
        this.walletAddress = resp.publicKey.toString();

        this.walletPublicKey = resp.publicKey; // PublicKey object

        this.walletConnected = true;

        this.walletBtn.setVisible(false);

     await this.refreshBalancesSafely();
     this.playBtn.setVisible(true);
     this.exitBtn.setVisible(true);
     const leaderboard = new Leaderboard();

     const statusPosition  = await leaderboard.getLastWeekPosition(this.walletPublicKey);

     const amountReward = 1;
      if (statusPosition == 1) {
        amountReward = 500;
      }else if (statusPosition == 2) {
        amountReward = 400;
      }else if (statusPosition == 3) {
        amountReward = 300;
      }else if (statusPosition == 4) {
        amountReward = 200;
      }else if (statusPosition == 5) {
        amountReward = 100;
      }





     if (statusPosition!== false && statusPosition !== 0 && statusPosition !== null) {
        this.createClaimButton(amountReward);
     }

      } catch (err) {
        console.error('User rejected connection', err);
      }
    } else {
      alert('Phantom wallet belum terpasang!');
    }
  }

  createClaimButton(amount = 1) {
    this.rewardClaimed = false;

    // Buat teks klaim reward (tengah atas)
    this.claimText = this.add.text(this.width / 2, 10, `Klaim ${amount} SOLR`, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arcadia',
      fontStyle: 'bold',
  }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });

    this.claimText.setInteractive();
 this.claimTextUnderline = this.add.graphics();
 const textWidth = this.claimText.width;
 const textHeight = this.claimText.height;
 this.claimTextUnderline.fillStyle(0xffffff, 1);
 this.claimTextUnderline.fillRect(
     this.width / 2 - textWidth / 2,
     10 + textHeight + 5,
     textWidth,
     2
 );

 this.claimText.on('pointerover', () => {
     this.claimText.setColor('#00cc66');
 });

 this.claimText.on('pointerout', () => {
     this.claimText.setColor('#ffffff');
 });


    this.claimText.on('pointerdown', async () => {
      await this.handleMint(amount);
  });

 this.claimText.on('pointerup', () => {
     this.claimText.setColor('#00cc66');
 })

}

  async refreshBalancesSafely() {

    if (!this.walletConnected || !this.walletPublicKey) return;

    try {
      const owner = this.walletPublicKey.toString();

      const sol = await getSolBalance(owner);

      const mint = this.getDummyMint();
      let tokenBalance = 0;
      try {
        tokenBalance = await getSplTokenBalance(owner, mint);
      } catch (e) {
        tokenBalance = 0;
      }

      this.balanceText.setText(`SOL: ${sol.toFixed(3)}  |  TOKEN: ${tokenBalance}`);
    } catch (e) {
      console.error('Gagal update saldo', e);
    }
  }

  getDummyMint() {
      const seed = new Uint8Array(32);
    seed.fill(42);
    const mintAuthority = require('@solana/web3.js').Keypair.fromSeed(seed);
    
    return this.addressToken;
  }
  

  start() {
    this.menuSong.stop();
    this.cameras.main.fadeOut(2000, 255, 255, 255);
    this.scene.start('instructions');
  }

  exit() {
    this.menuSong.stop();
    const ending = this.sound.add('ending', { volume: 0.25, loop: true });
    ending.play();
    this.cameras.main.fadeOut(2000, 0, 0, 0);
    this.scene.start('leaderboard-table', { song: ending });
  }

  update() {
    const bgs = [this.bg1,  this.bg3, this.bg4,  this.bg6, this.bg8];
    const fact = [0.1,  0.25, 0.4, 0.6, 1.5];

    bgs.forEach((bg, index) => {
      bg.tilePositionX += fact[index];
    });
  }
  openNotAvailable() {
    if (this.isNotAvailOpen) return;
    this.isNotAvailOpen = true;
    this.notAvailOverlay = this.add.rectangle(
      this.width / 2,
      this.height / 2,
      this.width * 0.6,
      this.height * 0.4,
      0x000000,
      0.8
    ).setOrigin(0.5);
  
    this.notAvailTitle = this.add.text(
      this.width / 2,
      this.height / 2 - 80,
      'COMING SOON',
      {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arcadia',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
  
    this.notAvailMsg = this.add.text(
      this.width / 2,
      this.height / 2 - 20,
      'Stay tuned for updates.',
      {
        fontSize: '20px',
        color: '#ffcc00',
        fontFamily: 'Arcadia',
        align: 'center',
        wordWrap: { width: this.width * 0.5 }
      }
    ).setOrigin(0.5);
  
    this.notAvailCloseBtn = this.add.text(
      this.width / 2,
      this.height / 2 + 60,
      '[ Close ]',
      {
        fontSize: '22px',
        color: '#ff6666',
        fontFamily: 'Arcadia',
        fontStyle: 'bold',
        backgroundColor: '#ffffff22',
        padding: { left: 10, right: 10, top: 5, bottom: 5 }
      }
    )
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerup', () => this.closeNotAvailable());
  }
  
  closeNotAvailable() {
    this.notAvailOverlay.destroy();
    this.notAvailTitle.destroy();
    this.notAvailMsg.destroy();
    this.notAvailCloseBtn.destroy();
    this.isNotAvailOpen = false;
  }
  

  openProfile() {
    if (this.isProfileOpen) return;
    this.isProfileOpen = true;
    this.profileOverlay = this.add.rectangle(
      this.width / 2,
      this.height / 2,
      this.width * 0.6,
      this.height * 0.6,
      0x000000,
      0.8
    ).setOrigin(0.5, 0.5);
  
    this.profileTitle = this.add.text(this.width / 2, this.height / 2 - 120, 'PROFILE', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arcadia',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  
    const walletAddr = this.walletConnected ? this.walletPublicKey.toString() : "Not Connected";
  
    this.profileWallet = this.add.text(this.width / 2, this.height / 2 - 40,
      `Wallet: ${walletAddr}`,
      {
        fontSize: '18px',
        color: '#00ffcc',
        fontFamily: 'Arcadia',
        wordWrap: { width: this.width * 0.5 }
      }
    ).setOrigin(0.5);
  
    this.profileBalance = this.add.text(this.width / 2, this.height / 2 + 10,
      this.balanceText.text,
      {
        fontSize: '20px',
        color: '#ffcc00',
        fontFamily: 'Arcadia'
      }
    ).setOrigin(0.5);
  
    this.profileCloseBtn = this.add.text(this.width / 2, this.height / 2 + 100, '[ Close ]', {
      fontSize: '22px',
      color: '#ff6666',
      fontFamily: 'Arcadia',
      fontStyle: 'bold',
      backgroundColor: '#ffffff22',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerup', () => this.closeProfile());
  }
  
  closeProfile() {
    this.profileOverlay.destroy();
    this.profileTitle.destroy();
    this.profileWallet.destroy();
    this.profileBalance.destroy();
    this.profileCloseBtn.destroy();
    this.isProfileOpen = false;
  }


  async handleMint(amount = 1) {
  try {
    const result = await mintSPLToken(this.walletPublicKey, amount);

    if (this.claimText) {
      this.claimText.setStyle({ color: "#00ff00" }); 
    }

    this.showError("Mint berhasil! Token telah dibuat.");

    await this.refreshBalancesSafely();
  } catch (err) {
    console.error("Mint gagal:", err);
    this.showError("Mint gagal!");

    if (this.claimText) {
      this.claimText.setStyle({ color: "#ff0000" }); 
    }
  }
}

  
  showError(message) {
    const errorText = this.add.text(
      this.width / 2,
      this.height / 2 + 150,
      message,
      {
        fontSize: '22px',
        color: '#ff4444',
        fontFamily: 'Arcadia',
        backgroundColor: '#00000088',
        padding: { left: 10, right: 10, top: 5, bottom: 5 }
      }
    ).setOrigin(0.5);
  
    this.time.delayedCall(2000, () => {
      errorText.destroy();
    });
  }

  playIsPressed() {
    this.playBtn.setTexture('playPressed');
  }

  playNotPressed() {
    this.playBtn.setTexture('play');
  }

  exitIsPressed() {
    this.exitBtn.setTexture('exitPressed');
  }

  exitNotPressed() {
    this.exitBtn.setTexture('exit');
  }

  walletIsPressed() { this.walletBtn.setTexture('wallet'); }
  walletNotPressed() { this.walletBtn.setTexture('wallet'); }

  profileIsPressed() {
    this.profileText.setStyle({ color: '#ffcc00' }); 
  }
  
  profileNotPressed() {
    this.profileText.setStyle({ color: '#00ffcc' });
  }
  
  multiplayerIsPressed() { this.multiplayerText.setStyle({ color: '#ffffff' }); }
multiplayerNotPressed() { this.multiplayerText.setStyle({ color: '#00ccff' }); }
openMultiplayer() { alert('Multiplayer mode belum dibuat'); }

inventoryIsPressed() { this.inventoryText.setStyle({ color: '#ffffff' }); }
inventoryNotPressed() { this.inventoryText.setStyle({ color: '#00ff99' }); }
openInventory() { alert('Inventory belum dibuat'); }

shopIsPressed() { this.shopText.setStyle({ color: '#ffffff' }); }
shopNotPressed() { this.shopText.setStyle({ color: '#ffcc00' }); }
openShop() { alert('Shop belum dibuat'); }

onMintPressed() {
  this.mintText.setStyle({ color: "#ffcc00" }); 
}




}