import React, { useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Info, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { toDateOnlyString } from '../utils/date';
import { Test, Course } from '../types';
import { Holiday } from '../hooks/queries';

type Tone = 'fatal' | 'descargos' | 'reconsideracion' | 'interno' | 'gcc';

const toneClasses: Record<Tone, { base: string; dot: string }> = {
  fatal: { base: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100', dot: 'bg-red-500' },
  descargos: { base: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100', dot: 'bg-amber-600' },
  reconsideracion: { base: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100', dot: 'bg-violet-600' },
  interno: { base: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100', dot: 'bg-blue-500' },
  gcc: { base: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100', dot: 'bg-emerald-500' }
};

interface Props {
  tests: CalendarEvent[];
  holidays: Holiday[];
  currentDate: Date;
  selectedDate: string | null;
  setSelectedDate: (d: string | null) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

type CalendarEvent = Test & {
  tone?: Tone;
  title?: string;
  course?: Course | null;
  courses?: Course | null;
  course_name?: string;
  courseName?: string;
};

const EMPTY_EVENTS: CalendarEvent[] = [];
const EMPTY_HOLIDAYS: Holiday[] = [];

const CalendarioPlazosLegales: React.FC<Props> = ({ tests = EMPTY_EVENTS, holidays = EMPTY_HOLIDAYS, currentDate, selectedDate, setSelectedDate, onPrev, onNext }) => {
  const [hovered, setHovered] = useState<null | { ev: CalendarEvent; rect: DOMRect }>(null);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const eventsByDay = (dayStr: string) => tests.filter((t) => toDateOnlyString(t.date) === dayStr);

  return (
    <div className="flex-1">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-visible">

        <div className="grid grid-cols-7 text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (<div key={d} className="py-3 text-center">{d}</div>))}
        </div>

        <div className="p-3">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-3 min-w-[720px]">
              {calendarDays.map((day) => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const dayEvents = eventsByDay(dayStr);
                const isToday = isSameDay(day, new Date());
                const isWeekend = [0, 6].includes(day.getDay());
                const holiday = (holidays || []).some((h) => h.date === dayStr);

                const cellClass = [
                  'min-h-28 border rounded-md p-2 flex flex-col',
                  !isSameMonth(day, currentDate) ? 'bg-slate-50/40 text-slate-300' : 'bg-white',
                  isWeekend ? 'bg-slate-100' : '',
                  holiday ? 'bg-red-50 border-2 border-red-300' : '',
                  isToday ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/30' : ''
                ].join(' ');

                return (
                  <div
                    key={dayStr}
                    className={cellClass}
                    onClick={() => setSelectedDate(dayStr)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Seleccionar día ${format(day, 'd')} de ${format(day, 'MMMM', { locale: es })}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedDate(dayStr);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-xs font-black">{format(day, 'd')}</div>
                      <div className="text-[10px] text-slate-400">{isWeekend ? (day.getDay() === 6 ? 'Sáb' : 'Dom') : ''}</div>
                    </div>

                    <div className="mt-2 flex-1 flex flex-col gap-2 overflow-hidden">
                      {dayEvents.slice(0, 5).map((ev) => {
                        // pick tone mapping from ev.type or ev.tone; default interno
                        const tone: Tone = (ev.tone as Tone) || 'interno';
                        const cls = toneClasses[tone];
                        return (
                          <button
                            key={ev.id}
                            className={`group text-xs font-black uppercase truncate px-3 py-1 rounded-md border ${cls.base} transition active:scale-95 text-left`}
                            onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setHovered({ ev, rect }); }}
                            onMouseLeave={() => setHovered(null)}
                            title={ev.description ?? ev.subject}
                            aria-label={`Evento ${ev.subject ?? ev.title} del día ${format(day, 'd/M/yyyy')}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDate(dayStr);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-5 rounded inline-block ${cls.dot}`} />
                              <span className="truncate">{ev.subject ?? ev.title}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar inside component for demo consistency (keeps layout similar to mockup) */}
      <div className="mt-4 lg:mt-0" />

      {hovered && (
        (() => {
          const { ev, rect } = hovered;
          const maxW = 320;
          const estH = 160;
          const centerLeft = rect.left + rect.width / 2 - maxW / 2;
          const left = Math.max(12, Math.min(centerLeft, window.innerWidth - maxW - 12));
          // Use viewport coordinates (DOMRect values are viewport-relative when obtained via getBoundingClientRect)
          let top = rect.bottom + 8;
          // if not enough space below, position above
          if (top + estH > window.innerHeight) {
            top = Math.max(8, rect.top - estH - 8);
          }
          const courseName = ev.course?.name || ev.courses?.name || ev.course_name || ev.courseName || '';

          return (
            <div
              style={{ left: `${left}px`, top: `${top}px` }}
              onMouseEnter={() => setHovered({ ev, rect })}
              onMouseLeave={() => setHovered(null)}
              className="fixed z-50 w-80 max-w-[320px] p-3 rounded-lg bg-white/90 backdrop-blur-md shadow-lg border border-slate-100"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Info className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-800 uppercase">{(ev.type || ev.tone || 'Evento').toString()}</div>
                  </div>

                  <div className="mt-1 text-base font-extrabold text-slate-900">{ev.subject ?? ev.title}</div>

                  {courseName ? <div className="mt-1 text-sm text-slate-600 flex items-center gap-2"><Bell className="w-4 h-4 text-amber-500" />{courseName}</div> : null}

                  {ev.description ? <div className="mt-2 text-sm text-slate-700">{ev.description}</div> : null}
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
};

export default CalendarioPlazosLegales;
