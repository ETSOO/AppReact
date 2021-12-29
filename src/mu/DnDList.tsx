import { DataTypes } from '@etsoo/shared';
import React, { CSSProperties } from 'react';
import {
    DragDropContext,
    Draggable,
    Droppable,
    DropResult
} from 'react-beautiful-dnd';

/**
 * DnD list props
 */
export interface DnDListProps {
    /**
     * Item renderer
     */
    children: (
        item: DataTypes.IdItem,
        index: number,
        onDelete: (index: number) => void
    ) => React.ReactNode;

    /**
     * Get list item style callback
     */
    getItemStyle?: (isDragging: boolean) => CSSProperties;

    /**
     * Get list style callback
     */
    getListStyle?: (isDraggingOver: boolean) => CSSProperties;

    /**
     * Top and bottom sides renderer
     */
    sideRenderer?: (
        top: boolean,
        onAdd: (item: DataTypes.IdItem) => boolean
    ) => React.ReactNode;

    /**
     * Name for hidden form input
     */
    name: string;
}

/**
 * Drag and drop list
 * @param props Props
 * @returns Component
 */
export function DnDList(props: DnDListProps) {
    // Destruct
    const {
        children,
        getItemStyle = (_isDragging) => ({}),
        getListStyle = () => undefined,
        name,
        sideRenderer
    } = props;

    // State
    const [items, setItems] = React.useState<DataTypes.IdItem[]>([]);

    // Drag end handler
    const onDragEnd = (result: DropResult) => {
        console.log(result);
        // Dropped outside the list
        if (!result.destination) {
            return;
        }

        // Clone
        const newItems = [...items];

        // Removed item
        const [removed] = newItems.splice(result.source.index, 1);

        // Insert to the destination index
        newItems.splice(result.destination.index, 0, removed);

        // Update the state
        setItems(newItems);
    };

    // Add handler
    const onAdd = (newItem: DataTypes.IdItem) => {
        // Existence check
        if (
            items.some(
                (item) =>
                    DataTypes.getItemId(item) === DataTypes.getItemId(newItem)
            )
        ) {
            return false;
        }

        // Clone
        const newItems = [newItem, ...items];

        // Update the state
        setItems(newItems);

        return true;
    };

    // Delete handler
    const onDelete = (index: number) => {
        // Clone
        const newItems = [...items];

        // Remove the item
        newItems.splice(index, 1);

        // Update the state
        setItems(newItems);
    };

    // Layout
    return (
        <React.Fragment>
            {sideRenderer && sideRenderer(true, onAdd)}
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId={name}>
                    {(provided, snapshot) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                        >
                            {items.map((item, index) => {
                                const id = DataTypes.getItemId(item);
                                return (
                                    <Draggable
                                        key={id}
                                        draggableId={id}
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{
                                                    ...getItemStyle(
                                                        snapshot.isDragging
                                                    ),
                                                    ...provided.draggableProps
                                                        .style
                                                }}
                                            >
                                                {children(
                                                    item,
                                                    index,
                                                    onDelete
                                                )}
                                            </div>
                                        )}
                                    </Draggable>
                                );
                            })}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            {sideRenderer && sideRenderer(false, onAdd)}
        </React.Fragment>
    );
}
