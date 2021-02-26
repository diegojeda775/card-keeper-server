function makeCardsArray(){
    return [
        {
            id: 1,
            name: 'Grim Tutor',
            set_id: 2,
            rarity: 'mythic',
            type: 'sorcery',
        },
        {
            id: 2,
            name: 'Lotus Cobra',
            set_id: 1,
            rarity: 'rare',
            type: 'creature',
        },
        {
            id: 3,
            name: 'Spoils of adventure',
            set_id: 1,
            rarity: 'rare',
            type: 'creature',
        }
    ];
    
}

function makeSetsArray(){
    return [
        {
            id: 1,
            title: 'Zendikar Rising'
        },
        {
            id: 2,
            title: 'Core 2021'
        }
    ];
    
}

function makeMaliciousCard() {
    const maliciousCard = {
        id: 1,
        name: 'Naughty naughty very naughty <script>alert(\"xss\");</script>',
        set_id: 2,
        rarity: `Bad image <img src=\"https://url.to.file.which/does-not.exist\" onerror=\"alert(document.cookie);\">. But not <strong>all</strong> bad.`,
        type: 'Naughty naughty very naughty <script>alert(\"xss\");</script>',
    }
    const expectedCard = {
      ...maliciousCard,
      name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      rarity: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
      type: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    }
    return {
      maliciousCard,
      expectedCard
    }
  }

  function makeMaliciousSet() {
    const maliciousSet = {
        id: 1,
        title: 'Naughty naughty very naughty <script>alert(\"xss\");</script>',
        }
    const expectedSet = {
        ...maliciousSet,
        title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    }
    return {
        maliciousSet,
        expectedSet
    }
}

module.exports ={
    makeCardsArray,
    makeMaliciousCard,
    makeSetsArray,
    makeMaliciousSet
}