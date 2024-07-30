import styles from '../styles/about.module.css';
import Logo from './logo';
import { PropTypes } from 'prop-types';

export default function About({ cb, cbToOpenDialog }) {
  return (
    <div className={styles.about}>
      <header>
        <Logo />
        <button onClick={() => {cb(false)}}>Back to homepage</button>
      </header>
      <main>
        <h1>All the boys have a story to tell.</h1>
        <article>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis mattis pretium diam, ac porttitor justo ullamcorper vel. Proin scelerisque dictum justo, et aliquam nisi rutrum eget. Ut imperdiet lacinia tortor, sed bibendum mi pulvinar non. In at finibus lectus, sit amet suscipit sem. Aliquam eleifend sapien at leo convallis maximus. Duis sagittis mi massa, ac ornare sapien volutpat at. Nullam feugiat lacus eget euismod dignissim. Donec hendrerit enim vitae elit laoreet, congue dictum felis gravida. Sed hendrerit hendrerit blandit. Integer faucibus, felis eget sollicitudin tempor, nulla risus elementum leo, et iaculis eros mauris ut urna. Nulla vitae massa non ligula posuere aliquam nec a massa. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nam tristique urna tellus, eget tristique ante pharetra ac. Pellentesque venenatis magna id dolor ornare euismod. Aliquam suscipit vestibulum enim quis ullamcorper.</p>
          <p>Mauris vestibulum scelerisque quam, nec luctus leo mattis quis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur ut ipsum lobortis, aliquam libero et, finibus tortor. Donec sit amet facilisis justo. Nullam justo leo, malesuada posuere tempus et, placerat id ante. Sed aliquam dictum ante at vehicula. Proin id mi sed turpis dapibus posuere vel id orci. Phasellus tincidunt et orci vitae auctor. Sed sed convallis nisi, a lacinia elit. Praesent eu augue quis elit dapibus luctus quis ac lorem.</p>
          
          <span className={styles.qoute}>
            Ultimately, our goal is just to make a nice website where the boys can exercise their right to blog. Winterdog did all the nice work! No suprises there.
          </span>

          <p>Donec mollis finibus rutrum. Vestibulum diam tellus, rutrum sit amet metus ut, placerat porta ligula. Quisque laoreet arcu et sagittis pretium. Suspendisse et cursus quam. Ut interdum risus sit amet magna blandit, a egestas urna ullamcorper. Nam laoreet odio feugiat sem consectetur venenatis. Nam at commodo lorem. Vestibulum finibus tortor lectus, sed laoreet lorem pharetra vel. Duis sollicitudin vestibulum ante vitae facilisis. Aliquam dapibus et nisl eu mollis. Mauris sit amet nunc eget tellus efficitur blandit quis sed arcu. Aenean venenatis ipsum in ligula laoreet, non convallis lorem imperdiet. Phasellus varius elit aliquam magna finibus varius. Nunc rhoncus sem at rutrum condimentum. Pellentesque lobortis faucibus hendrerit.</p>
          <p>Aenean eleifend viverra lectus. In rhoncus mi sit amet ultricies viverra. In hendrerit arcu sem, vel tempus lorem dictum a. Aenean consectetur risus sed aliquam pharetra. Duis ac laoreet mi, a scelerisque neque. Maecenas pellentesque molestie pellentesque. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec eu arcu nisl. Sed et viverra erat. Integer vel placerat tortor, sed bibendum quam. Sed venenatis ex pellentesque, iaculis magna ac, luctus ipsum. </p>
        </article>
      </main>
      <button onClick={() => {
        cb(false);
        cbToOpenDialog();
      }}>
        <span>Start reading</span>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
          <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"/>
        </svg>
      </button>
      <button onClick={() => {
        cb(false);
        cbToOpenDialog();
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

About.propTypes = {
  cb: PropTypes.func,
  cbToOpenDialog: PropTypes.func,
}