
import React from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent } from '@/components/ui/card';
import { Play, FileQuestion, GripVertical, Clock, Paperclip } from 'lucide-react';
import { Attachment } from '@/lib/attachmentQueries';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  order_index: number;
  created_at: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  type: string;
  time_limit: number | null;
  max_attempts: number | null;
  order_index: number;
  created_at: string;
}

interface CourseItem extends Partial<Lesson>, Partial<Quiz>, Partial<Attachment> {
  type: 'lesson' | 'quiz' | 'attachment';
  order_index: number;
}

interface DraggableItemProps {
  item: CourseItem;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  onSelect?: (type: 'lesson' | 'quiz' | 'attachment', id: string) => void;
  isSelected?: boolean;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const DraggableItem: React.FC<DraggableItemProps> = ({
  item,
  index,
  moveItem,
  onSelect,
  isSelected
}) => {
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'courseItem',
    item: { type: 'courseItem', id: item.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'courseItem',
    hover: (dragItem: DragItem) => {
      if (!dragPreview) {
        return;
      }

      const dragIndex = dragItem.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveItem(dragIndex, hoverIndex);
      dragItem.index = hoverIndex;
    },
  });

  const isLesson = item.type === 'lesson';
  const isQuiz = item.type === 'quiz';
  const isAttachment = item.type === 'attachment';
  
  let icon, iconColor, borderColor, selectedBorderColor;
  
  if (isLesson) {
    icon = Play;
    iconColor = 'text-primary';
    borderColor = 'border-primary/30';
    selectedBorderColor = 'border-primary/50 bg-primary/5';
  } else if (isQuiz) {
    icon = FileQuestion;
    iconColor = 'text-orange-500';
    borderColor = 'border-orange-500/30';
    selectedBorderColor = 'border-orange-500/50 bg-orange-500/5';
  } else if (isAttachment) {
    icon = Paperclip;
    iconColor = 'text-blue-500';
    borderColor = 'border-blue-500/30';
    selectedBorderColor = 'border-blue-500/50 bg-blue-500/5';
  }

  return (
    <div ref={drop}>
      <Card 
        className={`glass-card border-white/10 hover:${borderColor.replace('/30', '/20')} transition-all duration-300 cursor-pointer group ${
          isSelected ? selectedBorderColor : ''
        } ${isDragging ? 'opacity-50' : ''}`}
        onClick={() => onSelect?.(item.type, item.id!)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div
              ref={drag}
              className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${
              isLesson ? 'from-primary/20 to-primary-500/20' : 
              isQuiz ? 'from-orange-500/20 to-yellow-500/20' :
              'from-blue-500/20 to-blue-600/20'
            } border ${borderColor}`}>
              <span className="text-sm font-bold text-primary">{index + 1}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {React.createElement(icon, { className: `h-4 w-4 ${iconColor} flex-shrink-0` })}
                <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
              </div>
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
              {isQuiz && item.time_limit && (
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{item.time_limit}min</span>
                </div>
              )}
              {isAttachment && item.type && (
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <span className="capitalize">{item.type}</span>
                  {item.view_limit && (
                    <>
                      <span>•</span>
                      <span>{item.view_limit} views</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface DraggableCourseContentProps {
  lessons: Lesson[];
  quizzes: Quiz[];
  attachments: Attachment[];
  onReorder: (items: CourseItem[]) => void;
  onSelect?: (type: 'lesson' | 'quiz' | 'attachment', id: string) => void;
  selectedItemId?: string;
  selectedItemType?: 'lesson' | 'quiz' | 'attachment';
}

export const DraggableCourseContent: React.FC<DraggableCourseContentProps> = ({
  lessons,
  quizzes,
  attachments,
  onReorder,
  onSelect,
  selectedItemId,
  selectedItemType
}) => {
  // Mix lessons, quizzes, and attachments and sort by order_index
  const mixedItems: CourseItem[] = React.useMemo(() => {
    const lessonItems: CourseItem[] = lessons.map(lesson => ({
      ...lesson,
      type: 'lesson' as const
    }));
    
    const quizItems: CourseItem[] = quizzes.map(quiz => ({
      ...quiz,
      type: 'quiz' as const
    }));

    const attachmentItems: CourseItem[] = attachments.map(attachment => ({
      ...attachment,
      type: 'attachment' as const
    }));
    
    return [...lessonItems, ...quizItems, ...attachmentItems].sort((a, b) => a.order_index - b.order_index);
  }, [lessons, quizzes, attachments]);

  const [localItems, setLocalItems] = React.useState(mixedItems);

  React.useEffect(() => {
    setLocalItems(mixedItems);
  }, [mixedItems]);

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const newItems = [...localItems];
    const draggedItem = newItems[dragIndex];
    
    newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, draggedItem);
    
    // Update order_index for all items
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order_index: index + 1
    }));
    
    setLocalItems(updatedItems);
    onReorder(updatedItems);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-3">
        {localItems.map((item, index) => (
          <DraggableItem
            key={`${item.type}-${item.id}`}
            item={item}
            index={index}
            moveItem={moveItem}
            onSelect={() => onSelect?.(item.type, item.id!)}
            isSelected={selectedItemType === item.type && selectedItemId === item.id}
          />
        ))}
      </div>
    </DndProvider>
  );
};
