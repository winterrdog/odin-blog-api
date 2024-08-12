import styles from '../styles/about.module.css';
import Logo from './logo';

import { useNavigate } from 'react-router-dom';

export default function About() {

  const navigate = useNavigate();

  return (
    <div className={styles.about}>
      <header>
        <Logo />
        <button onClick={() => {navigate('/')}}>Back to homepage</button>
      </header>
      <main>
        <h1>All the boys have a story to tell.</h1>
        <article>
          <p>
            Look around you. Look at the world around you. What exactly is going on for you to be able to have these images inside your head? Well, your senses are receiving raw information right? You&apos;re seeing things, hearing things, smelling things. And you&apos;re processing all this raw information through your brain which organises it and makes sense of it. Your senses and mental faculties come together to create for you the crude map of the world that allows you to navigate it.
          </p>
          <p>
            But is this crude map of the world a total picture of reality? You can interact with items in the world, but your human experience of these items is not the totality of what those items are for a number of reasons. For example, you can not deny that while you see ,for example, a rock as a solid, static and unchanging thing, if we took that rock and looked at it under a microscope, you&apos;d see that it&apos;s actually 99.9% empty space and constantly moving.
          </p>
          <p>
            Point is, there is a disconnect between this crude map that we draw in our human experience of the world and how things actually are in reality. It seems like there are two worlds. The world of human experience, and the way reality is, independent of human experience. Philospher Emmanuel Kant thought that, no matter how hard, we try, we will never be able to directly access this world of things in themselves, the world of reality. But, another philospher, Arthur Schopenhauer, thought we didn&apos;t need to.
          </p>
          
          <span className={styles.qoute}>
            Why not look within?
          </span>

          <p>
            Schopenhauer thought, instead of looking outside of ourselves for an answer, why not look inside? Why not turn inward and try to understand something that we have a much more intimate understanding of than anything outside of ourselves—our selves? He says it here,
          </p>

          <span className={styles.qoute}>
          “Consequently, a way from within stands open to us to that real inner nature of things to which we cannot penetrate from without. It is, so to speak, a subterranean passage, a secret alliance which, as if by treachery, places us all at once in the fortress that cannot be taken by attack from without.”
          </span>

          <p>Schopenhauer would want you to ask yourself, what are you at your core? Like, look inward right now. When you truly endeavor fearlessly into understanding the nature of your being, what do you come face to face with there? What are you? Well, you seem to be a bag of skin and bones. But it&apos;s a bag of skin and bones that seems to be animated by something, right? No, he&apos;s not talking about a soul or a spirit here or anything. He&apos;s an atheist. What he&apos;s saying is that from the moment we come out of the womb, for some reason, there seems to be this force that&apos;s directing us, a force that 99% of us take for granted because it&apos;s the only life we&apos;ve ever known.</p>
          <p>We don&apos;t really think about it, but it&apos;s what he calls this subconscious, restless striving for things—this restless striving for your next meal or a new car or a better job. If you&apos;re a baby, it&apos;s for your next bottle or to roll across the room and try to stick your toy into a light socket. They seem to like to do that for some reason. Point is, why does the default state of human being seem to be animated by a constant, restless striving for things, always wanting, always reaching and trying to get something? You got your new baseball hat. Nice. And now what? What, you&apos;re done? You just spend the rest of your life sitting around staring at it, stroking it? No, you find something else to restlessly strive for.</p>
          <p>The explanation for all of this restless striving, if you&apos;re Schopenhauer, is that the world of things in themselves is not a world of things at all. That what exists on the other side of this veil of perception is a single force that he calls the will to life. Sometimes he just calls it will. Personally, I&apos;m not a big fan of calling it that—a little bit misleading. I mean, reason being, when you&apos;re talking to people in the top levels of these major universities about philosophy, calling it “will” in that context just starts to become kind of confusing because, well, it&apos;s the name of the great philosopher Jaden Smith&apos;s dad. And people start to get confused.</p>
          <p>Anyway, what follows from this if you&apos;re Schopenhauer is that what you are, what you&apos;ve always been, is a manifestation of this force—a thing cast into this realm, condemned to restlessly strive. And what follows from that, if you&apos;re Schopenhauer, is that it&apos;s not just you. Everything in the entire universe is also a manifestation of this force. An asteroid has a will to be an asteroid. A racoon has a will to be a racoon. Although in our human experience of the world we make sense of things by thinking in terms of things being separate from each other—space, time, cause and effect—although we do that, that&apos;s only the way that we make sense of it from our point of view, and that the reality is that everything in the entire universe is actually one. We&apos;re all one thing, a force, a force that&apos;s manifesting itself in countless different ways in our human experience.</p>
          <p>Now, look, at first glance you may think,</p>
          <span className={styles.qoute}>
          “Hooray! Hooray! We&apos;re all one! I knew it! What an amazing thing to believe. Now we can all start being nice to each other, right?”
          </span>
          <p>Uh, no. Think of the implications there. Think of the implications of the metaphysical picture Schopenhauer just laid out. If everything in the universe is ultimately one, and everybody has their own restless striving that they&apos;re working on—I mean, I got to eat eventually, don&apos;t I, or I die—slowly the reality sets in that it is an inexorable part of my existence that I must destroy another thing that is restlessly striving so that I can continue restlessly striving.</p>
          <p>In other words, I&apos;m a manifestation of this force. This plant is a manifestation of this force. We&apos;re ultimately one. That means I have to cannibalize myself in order to continue restlessly striving. In fact, that&apos;s not even the word for it, is it? What&apos;s the word for when you eat yourself? Actually, no, if you know the answer to that question, please, please, do not send me an email. I want to stay as far away from you as I possibly can.</p>
          <p>Now, just think about it. Like, if that is the truth, imagine what our lives navigating this universe become if you&apos;re Schopenhauer. We essentially live in this giant realm directed by this constant desire to restlessly strive for things, living alongside everything else in existence that&apos;s also restlessly striving for things. Now, imagine there&apos;s no divine providence. It&apos;s easy if you try. In other words, imagine there&apos;s nothing governing the universe that cares about whether you get hit by a commuter train or whether your mom gets her medication or whether an asteroid the size of Europe wants to occupy the same place in space that Europe wants to occupy.</p>
          <p>For all intents and purposes, we exist in a massive, completely disinterested realm with a veritable infinity of wills that are potentially competing with ours. We&apos;re condemned to a life of neurotically, restlessly striving for things, forced to self-mutilate just for the luxury of being able to continue striving for things. And to top it off, once you&apos;re aware of the reality of the fact that we&apos;re all one, now you get to look around you and witness the massive amount of suffering that&apos;s visited every second of every day and realize that that&apos;s ultimately you suffering.</p>
          <p>Schopenhauer asks, what thing, what person would ever choose to live in such a miserable place? Yet we persist because of that force that we&apos;re all manifestations of. It&apos;s too strong. Most people go their entire lives not even considering it, just restlessly striving until they die one day. He actually thinks it&apos;s being aware of how miserable this universe is that ultimately prompts people to do any kind of philosophy.</p>
          <p>He seems to think there&apos;s some kind of connection between how miserable you think the world is and your level of intellect. He says,</p>
          <span className={styles.qoute}>
          “The lower a man is in an intellectual respect, the less puzzling and mysterious existence is to him; on the contrary, everything, how it is and that it is, seems to him a matter of course.”
          </span>
          <p>Now, some of you out there are probably saying,</p>
          <span className={styles.qoute}>
          “Oh, come on, Schopenhauer. It&apos;s not that bad. The world is not some miserable place, necessarily. What about all the good stuff? Look, maybe you&apos;re miserable. Maybe you didn&apos;t design your life in a way where you have amazing people and things surrounding you all the time, but I did. And I can tell you from experience, the universe is not a miserable place.”
          </span>
          <p>See, to Schopenhauer, we do this, don&apos;t we? We plan and design our lives around trying to drown out that constant hum of misery that&apos;s in the back of our minds. We sit around. We think about what might make us happy. And we tell ourselves that ultimately the reason we do the things we do is because it&apos;s going to make us happy.<br/>Now, what&apos;s a really common prescription that people typically write early on in their life about what&apos;s going to make them happy? What&apos;s a common thing that people want at some point in their life that they think is going to fill their life with joy? Well, I want to graduate college. I want to get a job. I want to live in the city. <i>I want to meet somebody, fall in love, get married, have kids, and live happily ever after.</i> Right?</p>
          <p>Now, if you&apos;re somebody listening to this that has this dream of falling in love, getting married, having kids, or even if you&apos;re somebody that had this dream at some point in your life, Schopenhauer would probably want to ask you, why do you think you have this dream, specifically, this one in particular? Why do you think so many other people have this very same dream? What is it about it? Hm. Why are you so sure that getting married and having kids is going to bring you happiness?</p>
          <p>And intuitively as human beings, the answer seems pretty straightforward, right? Companionship, someone&apos;s always going to be there for you. You got these Rugrats running around with mammalian brains. They can&apos;t even choose to hate me if they wanted to. Biologically it&apos;s destined. Sounds like a pretty good deal to me.</p>
          <p>But Schopenhauer would say, that may be the story that you tell yourself in your head of why you want love in your life, but it&apos;s not why you&apos;re actually doing it. And look, love to Schopenhauer is, no question, one of the greatest things about life. He&apos;s just saying, understand the true reason you have such a strong desire to fall in love during your lifetime. He thinks that love is an elaborate scam.</p>
          <p>You&apos;re not getting married and having kids because you think it&apos;s going to make you happy. No, the will to life, this force that we&apos;re all enslaved to, is subconsciously compelling you to want kids for the sake of the propagation of the species. And if you doubt this, just think about the decision to have kids for a second. Think about all the costs that are associated with it: the financial costs—diapers are expensive; the emotional cost—cleaning crayon off the wall; the opportunity cost—all the things you could be doing; the cost of sleep deprivation; the cost of fearing for their safety; the cost of getting frustrated with them.</p>
          <p>Having a kid is an absolutely massive responsibility to take on. Nobody would disagree with that. Schopenhauer thinks that if you truly considered all the costs associated with having kids before having them, no rational being would ever have kids. They just wouldn&apos;t do it. No person thinking clearly would ever trade 10 to 15 minutes of feeling good for a lifetime of costs and responsibilities. He says that the will to life realizes this and it needs some powerful feeling that it can evoke in you and make you into a completely irrational person for a short period of time so that you&apos;ll have kids and keep the species going.</p>
          <p>We call this feeling of irrationality love. Love feels so good when you have it, and people want it so badly in their lives. But to Schopenhauer, it is the vehicle driving you to commit some crime that you&apos;ll later plead temporary insanity to. I mean, think of all the irrational things people have done in the name of love. Think of the blinders they put on. Think of the stories they tell themselves, the games they play. These are sick people.</p>
          <p>Now, some of you may be asking,</p>
          <span className={styles.qoute}>
          “Okay Schopenhauer, if love really is what you say it is. If it really is just a force that&apos;s enslaving me with the sole task of propagating the species, why don&apos;t I love everyone? Couldn&apos;t I have kids with basically anybody walking down the street, barring them having had some sort of tragic, tragic accident?”
          </span>
          <p>Well, yeah, you could. But the propagation of the species is not just concerned with sheer numbers. There are other criteria involved.</p>
          <p>And that whether you realize it or not, to Schopenhauer, the reason you fall in love with the people you do is not because you actually like things about their personality or feel comfortable with them; it&apos;s because you&apos;re subconsciously reading something about them. You&apos;re reading that they have strengths in areas that you have weaknesses, and they&apos;re reading that you have strengths where they have weaknesses. Aspects of both of your characters and appearances balance out each other—the end product of this entire exchange being more balanced and healthy children that are more likely to go on and reproduce.</p>
          <p>Schopenhauer thought that people who are tall tend to end up with people who are short. People who are meek tend to end up with people who are more courageous. Even though to you it just feels like you&apos;re making a free choice and that you really just like this person, what&apos;s actually going on is you&apos;re being subconsciously manipulated by the will to life to be attracted to a person that will create balanced children and propagate the species.</p>
          <p>Now, this really just leaves one question. If you&apos;re somebody that&apos;s unfortunate enough to be, you know, a 1 out of 10 on the attractiveness scale,</p>
          <span className={styles.qoute}>
          “Where are these hordes of supermodels that are helplessly attracted to me, Schopenhauer? Where are they? I&apos;m walking proof that you&apos;re wrong, Schopenhauer.”
          </span>
          <p>But he does bring up an interesting point, right? Maybe this is the reason so many people have the experience where they meet somebody; they fall in love, get married, have kids, and then either get divorced or remain immiserated in a relationship for decades staying together for the kids. Why is that such a common thing that people do? Schopenhauer says that getting married is like grasping blind into a sack of snakes and hoping to find an eel.</p>
          <p>This is one of my favorite passages of his. It&apos;s from his work <i>The World as Will and Representation</i>. It goes like this:</p>
          <span className={styles.qoute}>
          “A girl who rejects the proposal of a wealthy man and not an old man against her parents&apos;…convenience, according to her instinctive inclination, sacrifices her individual welfare to that of the species. But on this very account, we cannot withhold a certain approbation; for she has preferred what is more important, and has acted in the spirit of nature, whereas the parents advised her in the spirit of individual egoism. In consequence of all this, it seems as if, in making a marriage, either the individual or the interest of the species must come off badly. Often this must be the case, for that convenience and passionate love should go hand in hand is the rarest stroke of good fortune.”
          </span>
          <p>What he&apos;s saying is, if you&apos;re with someone, in his view, you&apos;re only with them because the will to life is subconsciously coercing you into having balanced children with them. And that may render you in a state of temporary insanity, but just know that once you have the kid, you aren&apos;t necessarily with somebody that&apos;s emotionally compatible to you. Once you propagate the species, you know, once that haze of insanity lifts off of you, you may very well find yourself in a relationship with somebody that you actually despise.</p>
          <p>One thing&apos;s for sure to Schopenhauer, much of the time people do find themselves fighting a battle to stay together, and that it&apos;s extremely rare if you happen to fall in love with somebody that you&apos;re actually compatible with, because, to Schopenhauer, the criteria you were using initially to choose them had nothing to do with compatibility. Anyway, Schopenhauer was a huge fan of love despite not having much of it himself throughout his life.</p>
          <p>Maybe we can sum up like this. I think the key thing about love that he&apos;d want people to realize—preferably as early in life as possible—is that we often sit around, and we think about how our lives are going to play out. We know that we want to be happy. And in that process, we often mistakenly conflate falling in love and being a happy person. We often think that there&apos;s some sort of direct connection between the two.</p>
          <p>But Schopenhauer wanted us to realize that the process of falling in love and the process of being a happy person are completely separate from each other. You can be happy without love, and you can love someone without being happy. And try to understand love for what it truly is. It&apos;s a tool. It&apos;s an extreme feeling that is needed to temporarily convince perfectly rational beings to do the most irrational thing they could ever do in their lives.</p>
          <p>From Episode #097, Philosphize this! Podcast by Stephen West. <a href="https://www.philosophizethis.org/">See also.</a></p>
        </article>
      </main>
      <button onClick={() => {
        navigate('/');
      }}>
        <span>Start reading</span>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
          <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"/>
        </svg>
      </button>
      <button onClick={() => {
        navigate('/');
      }}>
        <span>Start writing</span>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
          <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"/>
        </svg>
      </button>
      <footer>
        <Logo/>
      </footer>
    </div>
  );
}
