import React from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Edit, Trash2, GripVertical } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  order_index: number;
  created_at: string;
  duration_minutes?: number;
}

interface DraggableLessonItemProps {
  lesson: Lesson;
  index: number;
  moveLesson: (dragIndex: number, hoverIndex: number) => void;
  onEdit?: (lesson: Lesson) => void;
  onDelete?: (lessonId: string) => void;
  onSelect?: (lesson: Lesson) => void;
  isSelected?: boolean;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const DraggableLessonItem: React.FC<DraggableLessonItemProps> = ({
  lesson,
  index,
  moveLesson,
  onEdit,
  onDelete,
  onSelect,
  isSelected
}) => {
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'lesson',
    item: { type: 'lesson', id: lesson.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'lesson',
    hover: (item: DragItem) => {
      if (!dragPreview) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveLesson(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  return (
    <div ref={drop}>
      <Card 
        className={`glass-card border-white/10 hover:border-primary/20 transition-all duration-300 cursor-pointer group ${
          isSelected ? 'border-primary/50 bg-primary/5' : ''
        } ${isDragging ? 'opacity-50' : ''}`}
        onClick={() => onSelect?.(lesson)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div
              ref={drag}
              className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/20 border border-primary/30">
              <span className="text-sm font-bold text-primary">{index + 1}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Play className="h-4 w-4 text-primary flex-shrink-0" />
                <h3 className="font-semibold text-foreground truncate">{lesson.title}</h3>
                {lesson.duration_minutes && (
                  <span className="ml-2 text-xs text-muted-foreground">~{lesson.duration_minutes} min</span>
                )}
              </div>
              {lesson.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {lesson.description}
                </p>
              )}
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(lesson);
                  }}
                  className="glass-card border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(lesson.id);
                  }}
                  className="glass-card border-red-500/20 hover:border-red-500/50 hover:bg-red-500/10 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface DraggableLessonListProps {
  lessons: Lesson[];
  onReorder: (lessons: Lesson[]) => void;
  onEdit?: (lesson: Lesson) => void;
  onDelete?: (lessonId: string) => void;
  onSelect?: (lesson: Lesson) => void;
  selectedLessonId?: string;
}

export const DraggableLessonList: React.FC<DraggableLessonListProps> = ({
  lessons,
  onReorder,
  onEdit,
  onDelete,
  onSelect,
  selectedLessonId
}) => {
  const [localLessons, setLocalLessons] = React.useState(lessons);

  React.useEffect(() => {
    setLocalLessons(lessons);
  }, [lessons]);

  const moveLesson = (dragIndex: number, hoverIndex: number) => {
    const newLessons = [...localLessons];
    const draggedLesson = newLessons[dragIndex];
    
    newLessons.splice(dragIndex, 1);
    newLessons.splice(hoverIndex, 0, draggedLesson);
    
    // Update order_index for all lessons
    const updatedLessons = newLessons.map((lesson, index) => ({
      ...lesson,
      order_index: index + 1
    }));
    
    setLocalLessons(updatedLessons);
    onReorder(updatedLessons);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-3">
        {localLessons.map((lesson, index) => (
          <DraggableLessonItem
            key={lesson.id}
            lesson={lesson}
            index={index}
            moveLesson={moveLesson}
            onEdit={onEdit}
            onDelete={onDelete}
            onSelect={onSelect}
            isSelected={selectedLessonId === lesson.id}
          />
        ))}
      </div>
    </DndProvider>
  );
};
