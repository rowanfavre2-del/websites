import { Drawer } from './components/Drawer';
import { PresenterCursor, PresenterEngine } from './components/Presenter';
import { GraceCard, ProblemCard, TopBar, TrustStrip } from './components/Shell';
import { Stage } from './components/Stage';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-ivory text-ink lg:h-screen lg:overflow-hidden">
      <a href="#stage" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[70] focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Skip to demo
      </a>
      <TopBar />
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:flex-row lg:gap-5 lg:px-6 lg:py-3">
        <aside className="flex shrink-0 flex-col gap-3 lg:w-[30%] lg:min-w-[330px] lg:max-w-[440px] lg:overflow-y-auto" aria-label="The problem and the user">
          <ProblemCard />
          <GraceCard />
        </aside>
        <div id="stage" className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Stage />
        </div>
      </div>
      <TrustStrip />
      <PresenterEngine />
      <PresenterCursor />
      <Drawer />
    </div>
  );
}
